document.addEventListener("DOMContentLoaded", () => {
  let photos;
  const slides = document.getElementById('slides');
  const photosTemplate = Handlebars.compile(document.getElementById('photos').innerHTML);
  const photoInformationTemplate = Handlebars.compile(document.getElementById('photo_information').innerHTML);
  const photoCommentsTemplate = Handlebars.compile(document.getElementById('photo_comments').innerHTML);
  Handlebars.registerPartial('photo_comment', document.getElementById('photo_comment').innerHTML);
  let request = new XMLHttpRequest();
  request.open('GET', '/photos');
  request.responseType = 'json';

  request.addEventListener('load', event => {
    photos = request.response;
    let currentIndex = 0;
    slides.innerHTML = photosTemplate({photos});
    let currentID = () => photos[currentIndex].id;
    loadImageData(currentID());

    document.querySelector('#slideshow > ul').addEventListener('click', event => {

      switch (event.target.className) {
        case 'next':
          incrementCurrentIndex();
          break;
        case 'prev':
          decrimentCurrentIndex();
          break;
        default:
          return;
      }

      event.preventDefault();

      loadImageData(currentID());

      function incrementCurrentIndex() {
        currentIndex++;
        currentIndex %= photos.length;
      }

      function decrimentCurrentIndex() {
        currentIndex += photos.length + 1;
        currentIndex %= photos.length;
      }
    });


    document.getElementsByClassName('like')[0].addEventListener('click', event => {
      event.preventDefault();

      let request = new XMLHttpRequest();

      request.open('POST', '/photos/like');
      request.setRequestHeader('Content-Type', 'application/json');
      request.responseType = 'json';

      request.addEventListener('load', () => {
        document.getElementsByClassName('like')[0].textContent = document.getElementsByClassName('like')[0].textContent.replace(/\d+/, request.response.total);
      });
      request.send(JSON.stringify({photo_id: currentID()}));
    });

    document.getElementsByClassName('favorite')[0].addEventListener('click', event => {
      event.preventDefault();

      let request = new XMLHttpRequest();

      request.open('POST', '/photos/favorite');
      request.setRequestHeader('Content-Type', 'application/json');
      request.responseType = 'json';

      request.addEventListener('load', () => {
        document.getElementsByClassName('favorite')[0].textContent = document.getElementsByClassName('favorite')[0].textContent.replace(/\d+/, request.response.total);
      });
      request.send(JSON.stringify({photo_id: currentID()}));
    });

    document.getElementById('submit-comment').addEventListener('submit', event => {
      event.preventDefault();

      let form = event.target;

      let data = formDataToParam(new FormData(form));
      console.log(data);
      let request = new XMLHttpRequest();

      request.open('POST', '/comments/new');
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      request.responseType = 'json';

      request.addEventListener('load', event => {
        console.log(request.response);
        let comments = { comments: [request.response] };
        form.insertAdjacentHTML('beforebegin', photoCommentsTemplate(comments));
        form.reset();
      });
      request.send(data);
    });
  });

  request.send();

  function loadImageData(id) {
    document.querySelector('section > header').innerHTML = photoInformationTemplate(
      photos.filter(photo => id === +photo.id)[0]
    );

    loadImageComments(id);
  }

  function loadImageComments(id) {
    let commentRequest = new XMLHttpRequest();

    commentRequest.open('GET', `/comments?photo_id=${id}`);
    commentRequest.responseType = 'json';
    commentRequest.addEventListener('load', event => {

      let comments = {comments: commentRequest.response};

      document.querySelector('#comments').innerHTML = '<h3>Comments</h3>' + photoCommentsTemplate(comments);
    });
    commentRequest.send();
  }
});

function formDataToParam(formData) {
  let data = [];

  for (let [k, v] of formData) {
    data.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  }

  return data.join('&');
}