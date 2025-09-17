import React, { useState } from 'react'
const opts = ['Food','Culture','Nature','Shopping','Nightlife','Adventure']

export default function Interests(){ 
  const [sel, setSel] = useState([])
  function toggle(o){
    setSel(s=> s.includes(o) ? s.filter(x=>x!==o) : [...s,o])
  }
  return (
    <div className='flex flex-wrap gap-2 mt-2'>
      {opts.map(o=> (
        <button key={o} onClick={()=>toggle(o)} className='px-3 py-1 rounded-full bg-gray-100 text-sm'>{o}</button>
      ))}
    </div>
  )
}
