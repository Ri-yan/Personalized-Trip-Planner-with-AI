// Mock data + simple trip generator to simulate AI + Maps behavior
const PLACES = [
  { name:'Hawa Mahal', category:'Heritage', bestTime:'Morning (8-10AM)', cost:200, tags:['heritage'], rating:4.5 },
  { name:'Amber Fort', category:'Heritage', bestTime:'Morning (9-11AM)', cost:300, tags:['heritage','views'], rating:4.6 },
  { name:'Johri Bazaar', category:'Market', bestTime:'Afternoon (2-5PM)', cost:0, tags:['shopping','food'], rating:4.2 },
  { name:'Local Food Tour', category:'Food', bestTime:'Evening (7-9PM)', cost:800, tags:['food'], rating:4.7 },
  { name:'Nahargarh Fort', category:'Nature', bestTime:'Sunset (5-7PM)', cost:150, tags:['views','nature'], rating:4.4 },
  { name:'Street Food Walk', category:'Food', bestTime:'Night (8-10PM)', cost:300, tags:['food','nightlife'], rating:4.6 },
  { name:'City Palace', category:'Heritage', bestTime:'Afternoon (1-3PM)', cost:250, tags:['heritage','museum'], rating:4.5 },
]

function scoreForPlace(place, persona, budget){
  let score = Math.round(place.rating * 20) // base 80-100 scale
  if(persona==='Foodie Explorer' && place.tags.includes('food')) score += 10
  if(persona==='Adventure Seeker' && place.tags.includes('views')) score += 5
  if(budget < 5000 && place.cost > 500) score -= 10
  return Math.min(Math.max(score,50),99)
}

function generateTrip({destination='Jaipur', days=3, budget=10000, persona='Heritage Lover'}){
  const daysArr = []
  // simple distribution: pick top places by score
  const scored = PLACES.map(p=>({...p, score: scoreForPlace(p, persona, budget)}))
  scored.sort((a,b)=>b.score-a.score)
  for(let d=1; d<=days; d++){
    const items = []
    for(let i=0;i<2;i++){
      const p = scored[(d-1)*2 + i] || scored[i%scored.length]
      items.push({ time: i===0 ? '09:00' : '14:00', title: p.name, category: p.category, bestTime:p.bestTime, cost:p.cost, score:p.score })
    }
    daysArr.push({ day:d, items })
  }
  const totalCost = daysArr.flatMap(d=>d.items).reduce((s,it)=>s+ (it.cost||0), 0) + 2000
  return { title: `${days}-day ${destination} Experience`, days: daysArr, costEstimate: totalCost }
}

function quickSample(){ return generateTrip({destination:'Jaipur', days:3, budget:12000, persona:'Heritage Lover'}) }
function topPicks(){ return PLACES.slice(0,4) }

export default { generateTrip, quickSample, topPicks }
