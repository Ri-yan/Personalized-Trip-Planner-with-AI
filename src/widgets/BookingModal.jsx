import React from 'react'

export default function BookingModal({ show, onClose, item }){
  if(!show) return null
  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-md'>
        <h3 className='font-semibold text-lg mb-2'>Book: {item?.title || 'Activity'}</h3>
        <p className='text-sm text-gray-600 mb-4'>This is a demo booking flow. Integration with EMT & Google Pay will be done in backend.</p>
        <div className='flex gap-3'>
          <button onClick={onClose} className='px-4 py-2 border rounded'>Cancel</button>
          <button onClick={()=>{ alert('Booked (demo)'); onClose(); }} className='px-4 py-2 bg-green-600 text-white rounded'>Confirm & Pay</button>
        </div>
      </div>
    </div>
  )
}
