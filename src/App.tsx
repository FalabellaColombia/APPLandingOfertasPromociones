import Main from './pages/Main'
import './App.css'
import { ProductsProvider } from './contexts/ProductsProvider'
import { Toaster } from 'sonner'
import { ThemeProvider } from './contexts/ThemeProvider'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import PrivateRoute from './features/auth/routes/PrivateRoute'

function App() {
   return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
         <ProductsProvider>
            <Routes>
               <Route path="/login" element={<LoginPage />} />
               <Route
                  path="/dashboard"
                  element={
                     <PrivateRoute>
                        <Main />
                     </PrivateRoute>
                  }
               />
               <Route path="*" element={<LoginPage />} />{' '}
            </Routes>
            <Toaster position="bottom-left" />
         </ProductsProvider>
      </ThemeProvider>
   )
}

export default App
