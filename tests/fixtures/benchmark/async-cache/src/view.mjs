export function createView(cache,publish){
  let generation=0,disposed=false;
  return {
    async select(tenant,key){
      if(disposed)return;
      const token=++generation;
      try {const value=await cache.get(tenant,key);if(!disposed&&token===generation)publish({value,error:null});}
      catch(error){if(!disposed&&token===generation)publish({value:null,error:error.message});}
    },
    dispose(){disposed=true;generation++;},
  };
}
