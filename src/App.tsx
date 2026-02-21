import { Header, Footer, MainLayout, Carousel } from './components';
import { useContent } from './hooks';
import './App.css';

function App() {
  // Load content data using custom hooks
  const { content, loading, error, getSections } = useContent();
  const sections = getSections();
  const defaultThumbnailUrl =
    content?.metadata?.defaults?.thumbnailUrl || content?.metadata?.defaults?.hero?.imageUrl;

  return (
    <div className="app">
      <Header />
      
      <MainLayout
        heroTitle="Dan Park - Featured Roles"
        heroSubtitle="Software Engineer & Developer"
        heroBackgroundImage={content?.metadata?.defaults?.hero?.imageUrl}
        heroBackgroundVideo={content?.metadata?.defaults?.hero?.videoUrlMp4}
      >

        {sections
          .filter(section => section.enabled && section.items.length > 0)
          .map(section => (
            <Carousel
              key={section.id}
              title={section.title}
              items={section.items}
              defaultThumbnailUrl={defaultThumbnailUrl}
              modalConfig={section.modal}
            />
          ))}
        
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <p>Loading content...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>Error loading content. Please try again.</p>
          </div>
        )}
      </MainLayout>
      
      <Footer />
    </div>
  );
}

export default App;
