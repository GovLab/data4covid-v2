const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

// Function to download binary file
function downloadFile(url, localPath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        
        protocol.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}: ${url}`));
                return;
            }
            
            const fileStream = fs.createWriteStream(localPath);
            res.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            
            fileStream.on('error', (error) => {
                fs.unlink(localPath, () => {}); // Delete file on error
                reject(error);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Download assets from projects data
async function downloadProjectAssets() {
    console.log('Downloading project assets...');
    
    try {
        // Read the projects data
        const projectsDataPath = path.join(__dirname, 'data', 'projects.json');
        if (!fs.existsSync(projectsDataPath)) {
            console.error('Projects data not found. Run download-api-data.js first.');
            return;
        }
        
        const projectsData = JSON.parse(fs.readFileSync(projectsDataPath, 'utf8'));
        const projects = projectsData.data;
        
        const downloadedAssets = new Set();
        const updatedProjects = [];
        
        for (const project of projects) {
            const updatedProject = { ...project };
            
            if (project.thumbnail && project.thumbnail.data && project.thumbnail.data.full_url) {
                const assetUrl = project.thumbnail.data.full_url;
                const fileName = path.basename(assetUrl);
                const localPath = path.join(assetsDir, fileName);
                
                if (!downloadedAssets.has(fileName)) {
                    try {
                        console.log(`Downloading asset: ${fileName}`);
                        await downloadFile(assetUrl, localPath);
                        downloadedAssets.add(fileName);
                        console.log(`✓ Downloaded: ${fileName}`);
                    } catch (error) {
                        console.error(`✗ Error downloading ${fileName}:`, error.message);
                    }
                }
                
                // Update the project data to use local path
                updatedProject.thumbnail.data.full_url = `assets/${fileName}`;
            }
            
            updatedProjects.push(updatedProject);
        }
        
        // Save updated projects data with local asset paths
        const updatedData = { ...projectsData, data: updatedProjects };
        fs.writeFileSync(path.join(__dirname, 'data', 'projects-local.json'), JSON.stringify(updatedData, null, 2));
        console.log('Saved projects with local asset paths');
        
        // Also update the slug lookup file
        const projectsBySlug = {};
        updatedProjects.forEach(project => {
            if (project.slug) {
                projectsBySlug[project.slug] = project;
            }
        });
        fs.writeFileSync(path.join(__dirname, 'data', 'projects-by-slug-local.json'), JSON.stringify(projectsBySlug, null, 2));
        
        console.log(`Downloaded ${downloadedAssets.size} unique assets`);
        
    } catch (error) {
        console.error('Error downloading assets:', error);
    }
}

// Download external assets referenced in HTML/CSS
async function downloadExternalAssets() {
    console.log('Skipping external CDN assets as requested...');
    // We'll keep the CDN references in the HTML files for now
}

// Main execution
async function main() {
    console.log('Starting asset download...');
    
    await downloadProjectAssets();
    await downloadExternalAssets();
    
    console.log('Asset download complete!');
    console.log(`Assets saved to: ${assetsDir}`);
}

main().catch(console.error); 