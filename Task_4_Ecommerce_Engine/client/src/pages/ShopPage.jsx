import { useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { ProductGrid, ProductImage, ProductSkeletons } from '../components/StoreShell.jsx';
import { useStore } from '../context/StoreContext.jsx';

function NewsletterBand() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return <section className="newsletter-band"><div><span className="eyebrow eyebrow--light">The Serein letter</span><h2>A slower kind<br />of inbox.</h2></div><form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><label htmlFor="newsletter-email">Notes from the atelier, new releases, and little things worth keeping.</label><div className="newsletter-field"><input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" required /><button type="submit" aria-label="Subscribe to the Serein letter">{submitted ? <Check /> : <ArrowRight />}</button></div><span className="newsletter-confirm" aria-live="polite">{submitted ? 'You are on the list. Thank you.' : 'Occasional notes. Never noise.'}</span></form></section>;
}

export default function ShopPage() {
  const { products, loadingProducts } = useStore();
  const [category, setCategory] = useState('All pieces');
  const [query, setQuery] = useState('');
  const categories = ['All pieces', ...new Set(products.map((product) => product.category))];
  const visible = products.filter((product) => (category === 'All pieces' || product.category === category) && `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase()));
  const featured = products.filter((product) => product.featured).slice(0, 4);
  return (
    <main>
      <section className="hero"><div className="hero__copy"><span className="eyebrow eyebrow--light">The collection · 01 / 26</span><h1>Carry a little<br /><em>less ordinary.</em></h1><p>Considered leather goods, shaped by hand and made to gather a life of their own.</p><a className="button button--light" href="#collection">Explore the collection <ArrowDownRight size={17} /></a><span className="hero__note">Small batches. Made to be kept.</span></div><div className="hero__image"><ProductImage src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1600&q=90" alt="Sculptural leather handbag in warm natural light" /><div className="hero__image-caption"><span>Form No. 02</span><span>Soft grain · Cognac</span></div><div className="hero__stamp">S<br /><small>SM</small></div></div><div className="hero__index"><span>01</span><span className="hero__index-line" /><span>04</span></div></section>
      <section className="intro-band" id="atelier"><span className="eyebrow">Quietly distinct</span><p>We believe the things closest to us should be <em>made with intention.</em></p><a href="#journal" aria-label="Read about our atelier"><ArrowUpRight size={18} /></a></section>
      <section className="collection-section" id="collection"><div className="section-heading"><div><span className="eyebrow">A study in everyday</span><h2>The pieces we live in.</h2></div><a className="underlined-link" href="#all-pieces">View all pieces <ArrowRight size={15} /></a></div>{loadingProducts ? <ProductSkeletons /> : <ProductGrid products={featured} />}</section>
      <section className="craft-story" id="journal"><div className="craft-story__image"><ProductImage src="https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1400&q=85" alt="A maker working carefully with leather in a quiet studio" /></div><div className="craft-story__copy"><span className="eyebrow eyebrow--light">From the atelier</span><h2>Made slowly.<br /><em>Worn often.</em></h2><p>Each piece begins with a material worth keeping. We work with small family tanneries and independent makers, choosing character over perfection.</p><a href="#all-pieces" className="button button--outline">A closer look <ArrowUpRight size={16} /></a><span className="craft-story__signature">Serein, since 2018</span></div></section>
      <section className="collection-section collection-section--all" id="all-pieces"><div className="section-heading"><div><span className="eyebrow">The Serein collection</span><h2>Find your forever piece.</h2></div><label className="search-field"><span className="sr-only">Search pieces</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the collection" /><ArrowRight size={15} /></label></div><div className="collection-toolbar"><div className="category-tabs" role="group" aria-label="Filter by category">{categories.map((item) => <button type="button" className={category === item ? 'category-tab is-active' : 'category-tab'} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><span className="collection-count">{visible.length} pieces</span></div>{loadingProducts ? <ProductSkeletons /> : visible.length ? <ProductGrid products={visible} /> : <div className="empty-filter"><span className="eyebrow">No pieces found</span><p>Try another search or return to the full collection.</p><button type="button" className="underlined-link" onClick={() => { setQuery(''); setCategory('All pieces'); }}>Clear filters <ArrowRight size={15} /></button></div>}</section>
      <NewsletterBand />
    </main>
  );
}
