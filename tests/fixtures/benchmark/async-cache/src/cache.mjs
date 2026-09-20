export function createCache(fetcher, {ttl=1000, now=Date.now}={}) {
  const entries=new Map();
  const identity=(tenant,key)=>JSON.stringify([tenant,key]);
  const aborted=()=>Object.assign(new Error('Aborted'),{name:'AbortError'});
  return {
    get(tenant,key,{signal}={}) {
      if(signal?.aborted)return Promise.reject(aborted());
      const id=identity(tenant,key);let entry=entries.get(id);
      if(entry?.done&&now()>=entry.expires){entries.delete(id);entry=null;}
      if(!entry){
        entry={done:false};entries.set(id,entry);
        entry.promise=Promise.resolve().then(()=>fetcher(tenant,key)).then(value=>{
          entry.done=true;entry.expires=now()+ttl;return value;
        },error=>{if(entries.get(id)===entry)entries.delete(id);throw error;});
      }
      if(!signal)return entry.promise;
      return new Promise((resolve,reject)=>{
        const cleanup=()=>signal.removeEventListener('abort',cancel);
        const cancel=()=>{cleanup();reject(aborted());};
        signal.addEventListener('abort',cancel);
        entry.promise.then(value=>{cleanup();resolve(value)},error=>{cleanup();reject(error)});
        if(signal.aborted)cancel();
      });
    },
    invalidate(tenant,key){entries.delete(identity(tenant,key));},
  };
}
