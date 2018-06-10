        // const points = [];
        // // const item = {};
        // const reviews = [];
        // const newRewiewObj = {};
    // const modal = document.querySelector(".modal");
    // const modalTitle = document.querySelector(".modal__title");
    // const modalReviews = document.querySelector(".modal__reviews");
    // const inputName = document.querySelector(".input__name");
    // const inputPlace = document.querySelector(".input__place");
    // const inputArea = document.querySelector(".input__area");
    // const addButton = document.querySelector(".add__button");
    // const closeModal = document.querySelector(".smallCross");
    // const clientWidth = document.body.clientWidth;
    // const clientHeight = document.body.clientHeight;

ymaps.ready(function () {
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
        '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>' + 
        '<div class=date_footer>{{ properties.balloonContentDate|raw }}</div>'
    );

    var clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        clusterDisableClickZoom: true,
        // разобраться с этим свойством
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
    const clientWidth = document.body.clientWidth;
    const clientHeight = document.body.clientHeight;

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
                modalReviews.innerText = 'Отзывов пока нет...';        // это наверно не обязательно, по новому клику всегда новое окно открывается
            });

            // если модальное окно display:none, то вызываем функцию открытия
            if (modal.classList.contains('modal-closed')) {
                if (y > clientHeight - 425) {
                    if (x > clientWidth - 280) {
                        modal.style.top = clientHeight - 425 + 'px';
                        modal.style.left = x - 280 + 'px';
                        showModal(adress);
                    } else { modal.style.top = clientHeight - 425 + 'px';
                        modal.style.left = x + 'px';
                        showModal(adress);
                    }
                } else if (x > clientWidth - 280) {
                    modal.style.top = y + 'px';
                    modal.style.left = x - 280 + 'px';
                    showModal(adress);
                } else {
                    modal.style.top = y + 'px';
                    modal.style.left = x + 'px';
                    showModal(adress);
                }
            }                        
        });

        function showModal(adress) {
            // получаем адрес после клика по карте
            modal.classList.remove('modal-closed');
            modalTitle.innerText = adress;

            addButton.addEventListener('click', () => {
                if (inputName.value != '' || inputPlace.value != '' || inputArea.value != '') {
                    // после клика 'добавить' очищаем поле отзыва от шаблонной фразы и вызываем функцию создания блока отзыва
                    modalReviews.innerText = '';

                    createReview(adress);
                }
            })
        };

        function createReview(adress) {
            const divOutReview = document.createElement('div');
            const divNamePlace = document.createElement('div');
            const divReview = document.createElement('div');
            const newDate = new Date();

            divNamePlace.innerHTML = `${inputName.value} ${inputPlace.value} ${newDate.toLocaleString()}`;
            divReview.innerHTML = `${inputArea.value}`;

            const review = `${inputName.value} ${inputPlace.value} ${newDate.toLocaleString()} ${inputArea.value}`;

            createMark(coords, adress, newDate.toLocaleString());
            saveReview(coords, review);

            divOutReview.appendChild(divNamePlace);
            divOutReview.appendChild(divReview);
            modalReviews.appendChild(divOutReview);

            inputName.value = '';
            inputPlace.value = '';
            inputArea.value = '';
        };

        function saveReview(coords, review) {
            let points = [];
            let reviews = [review];

            if (localStorage.points) {
                try {
                    let parsedPoints = JSON.parse(localStorage.points);
                    // Метод Array.isArray() возвращает true, если объект является массивом
                    if (Array.isArray(parsedPoints)) {
                        points = [...parsedPoints];
                    } 
                }
                catch (e) {
                    console.log(e.message);
                }
            };
        // findIndex() возвращает индекс в массиве, если элемент удовлетворяет условию проверяющей функции, в противном случае: -1
            const pointIndex = points.findIndex(item => item.id[0] == coords[0] && item.id[1] == coords[1]);

                if (pointIndex == -1) {
                    reviews = [...reviews, ...points[pointIndex].reviews];        // выдает ошибку на-  .reviews]
                    const point = { id: coords, reviews };

                    points.splice(pointIndex, point, 1);
                } else {
                    points.push({ id : coords, reviews })
                }
                localStorage.points = JSON.stringify(points);

            // reviews.push({ divNamePlace : namePlace, divReview : review });
            // points.push({ id : coords, reviews : [reviews] });

            // localStorage.data = JSON.stringify({points});
            //     console.log(localStorage.data);
        };


        function createMark(coords, adress, date) {
            // Заполняем кластер геообъектами
            var placemarks = [];
            var placemark = new ymaps.Placemark(coords, {
                // Устаналиваем данные, которые будут отображаться в балуне
                balloonContentHeader: inputPlace.value,
                balloonContentBody: adress,
                balloonContentFooter: inputArea.value,
                balloonContentDate: date
            }, {
                preset: 'islands#icon',
                iconColor: '#735184'
            });
            placemarks.push(placemark);
            clusterer.add(placemarks);
            map.geoObjects.add(clusterer);
        }
    })
    clusterer.balloon.open(clusterer.getClusters());
})