import React from 'react'
import s from './index.module.css'
const Loader = () => {
  return (
    <div className="w-full h-full absolute top-0 left-0 z-10  flex justify-center items-center">
      <span className={s.loader} ></span>
    </div>
  )
}

export default Loader