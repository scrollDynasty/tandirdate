import React from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { MoreVertical } from 'lucide-react';

import { useState } from 'react';
import { Button, ConfigProvider, Modal } from 'antd';
import { createStyles, useTheme } from 'antd-style';


import { notification } from 'antd';






const submitComplaint = async (messageText, valueTxt) => {
  try{
    const response = await fetch('https://api.telegram.org/bot7654585303:AAFLJMpcU2znRSbob-KPUgM0XZE1QTqDR3k/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: 610691463,
        text: `Жалоба на сообщение: ${messageText}\n\nТекст жалобы: ${valueTxt}`, 
      }),
  })
  
  if (response.ok) {
    notification.success({
      message: 'Жалоба отправлена',
      description: 'Ваша жалоба успешно отправлена',
      placement: 'bottomRight',
    });
  }
}catch (error){
  console.error(error);}
}


function Menu({ message }) {
  const [valueTxt, setValueTxt] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log(valueTxt);

  const toggleModal = (open) => {
    setIsModalOpen(open);
  };

  const items = [
    {
      label: (
        <Button type="primary" onClick={() => toggleModal(true)}>

          Отправить жалобу
        </Button>
      ),
      key: '0',
    },
  ];

  return (



    <>
      <Dropdown
        className='mr-1'
        menu={{
          items,
        }}
        trigger={['click']}
      >
        <Space>
          <MoreVertical size={20} />
        </Space>

      </Dropdown>

      {/* Модал */}

      <Modal
        title={`Отправка жалобы: ${message}`}
        open={isModalOpen}
        onOk={() => toggleModal(false)}
        onCancel={() => toggleModal(false)}
        footer={[
          <Button key="back" onClick={() => toggleModal(false)}>
            Отмена
          </Button>,
          <Button key="submit" type="primary" onClick={() => { toggleModal(false); submitComplaint(message, valueTxt); }}>
            Отправить
          </Button>,
        ]}
      >
        <p>Опишите причину жалобы:</p>
        <textarea onChange={(e) => setValueTxt(e.target.value)} className="w-full p-2 border rounded-lg" rows="4" placeholder="Введите текст..." />
      </Modal>
    </>
  );
}
export default Menu;