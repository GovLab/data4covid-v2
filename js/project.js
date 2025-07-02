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
      apiURL: 'https://directus.thegovlab.com/data4covid',
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
      
      // Try to load from local data first (offline mode)
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
              console.log('Loaded project from local JSON file');
            } else {
              console.log('Project not found in local data, trying API...');
              this.fetchFromAPI();
            }
          })
          .catch(error => {
            console.log('Local data not available, trying API...');
            this.fetchFromAPI();
          });
      } else {
        this.fetchFromAPI();
      }
    },

    fetchFromAPI() {
      self = this;
      const client = new DirectusSDK({
        url: "https://directus.thegovlab.com/",
        project: "data4covid",
        storage: window.localStorage
      });

      client.getItems(
  'projects',
  {
    filter: {
      slug: self.memberslug
    },
    fields: ['*.*']
  }
).then(data => {
  
  self.indexData = data.data;
  self.filterData = self.indexData;
})
.catch(error => console.error(error));
    },
    dateShow(date) {
      return moment(date).format("MMMM YYYY");
    },
}});


