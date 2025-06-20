import Main from './pages/Main'
import './App.css'
import { Toaster } from 'sonner'
import { ThemeProvider } from './contexts/ThemeProvider'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import PrivateRoute from './features/auth/routes/PrivateRoute'
import { ProductsProvider } from './contexts/ProductsProvider'
import FiltersProvider from './contexts/FiltersProvider'

function App() {
   return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
         <ProductsProvider>
            <FiltersProvider>
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
            </FiltersProvider>
         </ProductsProvider>
      </ThemeProvider>
   )
}

export default App
