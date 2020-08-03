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
    
  el: '#home-page',
    
  data () {
  
    return {
      indexData: [],
      apiURL: 'https://directus.thegovlab.com/data4covid',
    }
  },

  created: function created() {
    this.fetchIndex();
  },
  methods: {

    fetchIndex() {
      self = this;
      const client = new DirectusSDK({
        url: "https://directus.thegovlab.com/",
        project: "data4covid",
        storage: window.localStorage
      });

      client.getItems(
  'projects',
  {
    fields: ['*.*']
  }
).then(data => {
  console.log(data)
  self.indexData = data.data;
})
.catch(error => console.error(error));
    }
}
});


