import React, {  useContext, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { privateRoutes, publickRoutes } from '../routes'
import Loader from './loader/Loader'
import { Context } from '../main'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const AppRouter = () => {
  const { auth } = useContext(Context);
  const [user, setUser] = useState(null); // Состояние для хранения текущего пользователя
  const [loading, setLoading] = useState(true); // Состояние для загрузки


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [auth]);

    // Очистка слушателя при размонтировании компонента
  
  
  if (loading) {
    return <Loader />; // Показать лоадер во время проверки состояния
  }
  return (
      <Routes>
        {
          user  ?
            privateRoutes.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))

            :
            publickRoutes.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))
        }
        <Route path='*' element={<Navigate to={user ? '/chat' : '/login'} />} />

      </Routes>


  )
}

export default AppRouter