const fs = require('fs');
const path = require('path');
const https = require('https');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Directus API configuration
const DIRECTUS_URL = 'https://directus.thegovlab.com';
const PROJECT = 'data4covid';

// Function to make HTTPS request
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Download projects data
async function downloadProjects() {
    console.log('Downloading projects data...');
    try {
        const url = `${DIRECTUS_URL}/${PROJECT}/items/projects?fields=*.*`;
        const data = await makeRequest(url);
        
        // Save raw data
        fs.writeFileSync(path.join(dataDir, 'projects.json'), JSON.stringify(data, null, 2));
        console.log(`Downloaded ${data.data.length} projects`);
        
        // Create a lookup map by slug for easy access
        const projectsBySlug = {};
        data.data.forEach(project => {
            if (project.slug) {
                projectsBySlug[project.slug] = project;
            }
        });
        
        fs.writeFileSync(path.join(dataDir, 'projects-by-slug.json'), JSON.stringify(projectsBySlug, null, 2));
        console.log('Created projects-by-slug.json lookup file');
        
        return data.data;
    } catch (error) {
        console.error('Error downloading projects:', error);
        return [];
    }
}

// Download assets referenced in the data
async function downloadAssets(projects) {
    console.log('Downloading assets...');
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir);
    }
    
    const downloadedAssets = new Set();
    
    for (const project of projects) {
        if (project.thumbnail && project.thumbnail.data && project.thumbnail.data.full_url) {
            const assetUrl = project.thumbnail.data.full_url;
            const fileName = path.basename(assetUrl);
            const localPath = path.join(assetsDir, fileName);
            
            if (!downloadedAssets.has(fileName)) {
                try {
                    console.log(`Downloading asset: ${fileName}`);
                    const assetData = await makeRequest(assetUrl);
                    
                    // For images, we need to handle binary data differently
                    // For now, let's just save the URL mapping
                    downloadedAssets.add(fileName);
                } catch (error) {
                    console.error(`Error downloading asset ${fileName}:`, error);
                }
            }
            
            // Update the project data to use local path
            project.thumbnail.data.full_url = `assets/${fileName}`;
        }
    }
    
    // Save updated projects data with local asset paths
    fs.writeFileSync(path.join(dataDir, 'projects-local.json'), JSON.stringify(projects, null, 2));
    console.log('Saved projects with local asset paths');
}

// Main execution
async function main() {
    console.log('Starting API data download...');
    
    const projects = await downloadProjects();
    await downloadAssets(projects);
    
    console.log('Download complete!');
    console.log(`Data saved to: ${dataDir}`);
    console.log(`Assets saved to: ${path.join(__dirname, 'assets')}`);
}

main().catch(console.error); 