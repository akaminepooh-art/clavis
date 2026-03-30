import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { TopPage } from './pages/TopPage'
import { CategoryPage } from './pages/CategoryPage'
import { ContentPage } from './pages/ContentPage'
import { FortunePage } from './apps/fortune/FortunePage'
import { HistoryPage } from './pages/HistoryPage'
import { SearchPage } from './pages/SearchPage'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/content/:contentId" element={<ContentPage />} />
          <Route path="/apps/fortune" element={<FortunePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App
