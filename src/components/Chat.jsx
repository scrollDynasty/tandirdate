import React, { useState } from 'react'
import {Button, Input} from "@nextui-org/react";
import { IoSendSharp } from "react-icons/io5";


const Chat = () => {

  const [value, setValue] = useState()

  const submit = ()=> {
    console.log(value);
  }
  
  return (
    <div className='  h-screen pt-[64px] m-auto container   text-3xl flex flex-col gap-4 items-start  '>
      <div className='w-full bg-stone-950 rounded-2xl mt-4 h-3/4'>
      </div>

      <div className='w-full flex items-center'>
        <Input label="Message" className='h-14 ' radius='none' placeholder="Enter your Message" onChange={e=> setValue(e.target.value)} />
        <Button color='primary' onClick={submit} className='text-2xl rounded-l-none h-14 ' endContent={<IoSendSharp />}></Button>
      </div>
    </div>
  )
}

export default Chat