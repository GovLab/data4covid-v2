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
      filterData: [],
      js_project_types: [
        { code: '', name: 'All' },
        { code: 'collabs', name: 'Data Collaborative' },
        { code: 'proposals-challenges', name: 'Data Challenges and Calls for Proposals' },
        { code: 'requests', name: 'Requests for Data and Expertise' }
      ],
      js_regions: [
        { code: '', name: 'All' },
        { code: 'eap', name: 'East Asia and Pacific' },
        { code: 'eca', name: 'Europe and Central Asia' },
        { code: 'lac', name: 'Latin America and the Caribbean' },
        { code: 'mena', name: 'Middle East and North Africa' },
        { code: 'na', name: 'North America' },
        { code: 'ssa', name: 'Sub-Saharan Africa' },
        { code: 'global', name: 'Global' },
      ],
      js_areas: [
        { code: '', name: 'All' },
        { code: 'spread', name: 'Tracking Disease Spread' },
        { code: 'treatment', name: 'Developing Disease Treatment' },
        { code: 'supplies', name: 'Identifying Availability of Supplies' },
        { code: 'aderence', name: 'Monitoring Adherence to Non-Pharmaceutical Interventions' },
        { code: 'perceptions', name: 'Understanding Public Perceptions and Behavior' },
        { code: 'accountability', name: 'Protecting Human Rights and Promoting Accountability' },
        { code: 'misinformation', name: 'Addressing Misinformation' },
        { code: 'recovery', name: 'Supporting Post-Pandemic Re-openings and Recovery' },
        { code: 'unemployment', name: 'Alleviating Pandemic-related Unemployment and Poverty' },
        { code: 'protections', name: 'Guaranteeing Protections for Workers' },
        { code: 'upskilling', name: 'Supporting Education and Upskilling' },
        { code: 'solvency', name: 'Fostering Business and Government Solvency' },
      ],
      selectedProjectType: null,
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
  
  self.indexData = data.data;
  self.filterData = self.indexData;
})
.catch(error => console.error(error));
    },
    dateShow(date) {
      return moment(date).format("MMMM YYYY");
    },
    searchItems(){

      squery = document.getElementById('search-text').value;
      let searchData = self.indexData.filter(items => items.title.toLowerCase().includes(squery.toLowerCase()));
      self.filterData =  searchData;
    },
    ResetItems(){
      self.filterData =  self.indexData;
    },
    changeFilter (event) {
      var element = document.body.querySelectorAll("select");
      this.selectedProjectType = element[0].value;
      this.selectedRegion = element[1].value;
      this.selectedArea = element[2].value;
      //Project Type Filter
      if (this.selectedProjectType == '')
        self.filtered_pt = self.indexData;
      else{
        let filtered_by_project_type = self.indexData.filter(function (e) {
          return e.project_type.some(pt_element => pt_element == self.selectedProjectType);
        });
        self.filtered_pt=filtered_by_project_type;
      }
      //Region Filter
      if (this.selectedRegion == '')
        self.filtered_region = self.filtered_pt;
      else{
        let filtered_by_region= self.filtered_pt.filter(function (e) {
          return e.region.some(reg_element => reg_element == self.selectedRegion);
        });
        self.filtered_region = filtered_by_region ;
      }
       //Topic Area Filter
      if (this.selectedArea == '')
        self.filtered_area = self.filtered_region;
      else{
        let filtered_by_area= self.filtered_region.filter(function (e) {
          return e.topic_areas.some(are_element => are_element == self.selectedArea);
        });
        self.filtered_area = filtered_by_area ;
      }
      self.filterData =  self.filtered_area;
      }
}});


