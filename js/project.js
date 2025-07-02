////////////////////////////////////////
// reload page after Forward and back
///////////////////////////////////////

const TYPE_BACK_FORWARD = 2;

function isReloadedPage() {
  return performance.navigation.type === TYPE_BACK_FORWARD;
}

function main() {
  if (isReloadedPage()) {
    window.location.reload();
  }
}
main();

////////////////////////////////////////////////////////////
///// TEAM  API REQUEST ` `
////////////////////////////////////////////////////////////

Vue.use(VueMeta);

new Vue({
    
  el: '#project-page',
    
  data () {
 
    return {
      filterData: [],
    }
  },

  created: function created() {

    this.memberslug=window.location.href.split('/');
    this.memberslug = this.memberslug[this.memberslug.length - 1];
    console.log('Extracted slug:', this.memberslug);
    console.log('Current URL:', window.location.href);
    this.fetchIndex();

  },
  methods: {

    fetchIndex() {
      self = this;
      
      console.log('Fetching data for slug:', self.memberslug);
      console.log('DATA_PATH:', window.DATA_PATH);
      
      // Load from local data only (offline mode)
      if (window.DATA_PATH) {
        const dataUrl = window.DATA_PATH + 'projects-by-slug-local.json';
        console.log('Loading from:', dataUrl);
        
        fetch(dataUrl)
          .then(response => response.json())
          .then(data => {
            console.log('Loaded data, looking for slug:', self.memberslug);
            console.log('Available slugs count:', Object.keys(data).length);
            
            if (data[self.memberslug]) {
              const project = data[self.memberslug];
              
              // Fix asset URLs for offline mode
              if (window.ASSET_PATH && project.thumbnail && project.thumbnail.data && project.thumbnail.data.full_url) {
                if (project.thumbnail.data.full_url.startsWith('assets/')) {
                  project.thumbnail.data.full_url = window.ASSET_PATH + project.thumbnail.data.full_url;
                }
              }
              
              self.indexData = [project];
              self.filterData = self.indexData;
              console.log('Loaded project from local JSON file (offline mode)');
            } else {
              console.error('ERROR: Project slug "' + self.memberslug + '" not found in local data.');
              console.error('Available slugs:', Object.keys(data));
              // Don't fall back to API - this is offline-only
            }
          })
          .catch(error => {
            console.error('ERROR: Local data not available. This site requires offline data to function.');
            console.error('Please ensure projects-by-slug-local.json exists in the data directory.');
            // Don't fall back to API - this is offline-only
          });
      } else {
        console.error('ERROR: DATA_PATH not set. This site requires offline data to function.');
        // Don't fall back to API - this is offline-only
      }
    },

    dateShow(date) {
      return moment(date).format("MMMM YYYY");
    },
}});


