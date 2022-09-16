import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { PixabayApi } from './api';
import createMarkup from './gallery.hbs';

const submitBtnEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const targetEl = document.querySelector('.js-guard');

const pixabayApi = new PixabayApi();
const gallery = new SimpleLightbox('.gallery a');

const observerOptions = {
    root: null,
    rootMargin: '0px 0px 100px 0px',
    threshold: 1,
}
const observer = new IntersectionObserver(async enteries => {
    if (enteries[0].isIntersecting) {
        try {
            pixabayApi.page += 1;
            
            const { data } = await pixabayApi.fetchPhoto();
            galleryEl.insertAdjacentHTML('beforeend', createMarkup(data.hits));
            gallery.refresh();

            if (data.hits.length <= 0) {
                observer.unobserve(targetEl);
                Notiflix.Notify.info(
                    "We're sorry, but you've reached the end of search results.")
            }
        } catch (error) {
            Notiflix.Notify.failure(
                'Sorry, there are no images matching your search query. Please try again.'
            )
        }
    }
}, observerOptions);



const onSearchImagesSubmit = async event => {
    event.preventDefault();
    observer.unobserve(targetEl);
    

  pixabayApi.page = 1;
  galleryEl.innerHTML = '';
  pixabayApi.searchQuery = event.currentTarget.elements.searchQuery.value;

  try {
    if (pixabayApi.searchQuery !== '') {
        const { data } = await pixabayApi.fetchPhoto();
        
      if (data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      if (data.totalHits === 1) {
        galleryEl.insertAdjacentHTML('beforeend', createMarkup(data.hits));
        return;
      }

      galleryEl.insertAdjacentHTML('beforeend', createMarkup(data.hits));
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        gallery.refresh();
        observer.observe(targetEl);

    }
  } catch (error) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  
};

submitBtnEl.addEventListener('submit', onSearchImagesSubmit);