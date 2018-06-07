        const points = [];
        // const item = {};
        const reviews = [];
        // const newRewiewObj = {};

ymaps.ready(function () {
    // var mapCenter = [55.755381, 37.619044],
       var map = new ymaps.Map('map', {
            center: [55.755381, 37.619044],
            zoom: 11,
            controls: []
        });

    // Создаем собственный макет с информацией о выбранном геообъекте.
    var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
            '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
            '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
    );

    var clusterer = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        // Устанавливаем стандартный макет балуна кластера "Карусель".
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        // Устанавливаем собственный макет.
        clusterBalloonItemContentLayout: customItemContentLayout,
        // Устанавливаем режим открытия балуна. 
        // В данном примере балун никогда не будет открываться в режиме панели.
        clusterBalloonPanelMaxMapArea: 0,
        // Устанавливаем размеры макета контента балуна (в пикселях).
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 130,
        // Устанавливаем максимальное количество элементов в нижней панели на одной странице
        clusterBalloonPagerSize: 5
        // Настройка внешего вида нижней панели.
        // Режим marker рекомендуется использовать с небольшим количеством элементов.
        // clusterBalloonPagerType: 'marker',
        // Можно отключить зацикливание списка при навигации при помощи боковых стрелок.
        // clusterBalloonCycling: false,
        // Можно отключить отображение меню навигации.
        // clusterBalloonPagerVisible: false
    });


    const modal = document.querySelector(".modal");
    const modalTitle = document.querySelector(".modal__title");
    const modalReviews = document.querySelector(".modal__reviews");
    const inputName = document.querySelector(".input__name");
    const inputPlace = document.querySelector(".input__place");
    const inputArea = document.querySelector(".input__area");
    const addButton = document.querySelector(".add__button");
    const closeModal = document.querySelector(".smallCross");

    map.events.add('click', function (e) {
        const coords = e.get('coords');
        const x = e._cacher._cache.pagePixels[0];
        const y = e._cacher._cache.pagePixels[1];

        ymaps.geocode(coords).then(function(res) {
            const firstGeoObject = res.geoObjects.get(0);
            let adress = firstGeoObject.getAddressLine();

            // закрыть модальное окно по крестику
            closeModal.addEventListener('click', () => {
                modal.classList.add('modal-closed');
                modalReviews.innerText = 'Отзывов пока нет...';
            });

            // если модальное окно display:none, то вызываем функцию открытия и задаем координаты верхней левой точки
            if (modal.classList.contains('modal-closed')) {
                modal.style.top = y + 'px';
                modal.style.left = x + 'px';
                showModal(adress);
            }                        
        });


        function showModal(adress) {
            // получаем адрес после клика по карте
            modal.classList.remove('modal-closed');
            modalTitle.innerText = adress;

            addButton.addEventListener('click', () => {
                if (inputName.value != '' || inputPlace.value != '' || inputArea.value != '') {
                    // после клика добавить очищаем поле отзыва от шаблонной фразы и вызываем функцию создания блока отзыва
                    modalReviews.innerText = '';
                    
                    createReview();
                    createMark();
                }
            })
        }

        function createReview() {
            const divOutReview = document.createElement('div');
            const divNamePlace = document.createElement('div');
            const divReview = document.createElement('div');
            const newDate = new Date();

            divNamePlace.innerHTML = `${inputName.value} ${inputPlace.value} ${newDate.toLocaleString()};`
            divReview.innerHTML = inputArea.value;

            // добавляем инфо из инпута в блоки и сохраняем в объект эти значения с помощью функции
            saveReview(divNamePlace.innerHTML, divReview.innerHTML);

            divOutReview.appendChild(divNamePlace);
            divOutReview.appendChild(divReview);
            modalReviews.appendChild(divOutReview);

            inputName.value = '';
            inputPlace.value = '';
            inputArea.value = '';
        }

        function saveReview(namePlace, review) {
            // newRewiewObj.divNamePlace = namePlace;
            // newRewiewObj.divReview = review;
            // item.id = coords;
            // item.reviews = reviews;

            reviews.push({ divNamePlace : namePlace, divReview : review });
            points.push({ id : coords, reviews : [reviews] });

            localStorage.data = JSON.stringify({points});
                console.log(localStorage.data);
        }

    // const points = JSON.parse(localStorage.points);
    // const review = { text: 'текст нового отзыва'}
    // const index = points.findIndex(item => item.id == address) // находим точку с таким же адресом
    // if(index !== -1){
    //     const newPointState = {...points[index], reviews: [...points[index].reviews, review};
    //     points.splice(index, newPointState);
    // } else {
    //     points.push({ id: 'address', reviews: [review] })
    // }
    // localStorage.setItem('points', points);

        function createMark() {
            // Заполняем кластер геообъектами
            var placemarks = [];
            // for (var i = 0, l = 10; i < l; i++) {
            var placemark = new ymaps.Placemark(coords, {
                // Устаналиваем данные, которые будут отображаться в балуне.
                balloonContentHeader: 'inputPlace',
                balloonContentBody: 'address - ссылка',
                balloonContentFooter: 'inputArea'
            }, {
                preset: 'islands#icon',
                iconColor: '#735184'
            });
            placemarks.push(placemark);
            // }
            clusterer.add(placemarks);
            map.geoObjects.add(clusterer);
        }
    })

    clusterer.balloon.open(clusterer.getClusters());
});


