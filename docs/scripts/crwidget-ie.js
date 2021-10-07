/**
 * Currency Rate Widget предоставляет данные курсов валют Центрального Банка России на сайте для IE
 */
var CRWidget = {
    '_urlAPI':      'https://www.cbr-xml-daily.ru/daily_json.js',
    '_urlStyle':    './styles/crwidget-style.css',
   
    'options': {
        'id':           'crwidget',
        'container':    'container_for_crwidget',
        'favorite':     ['USD', 'EUR'],
        'fullValue':    true,
        'deltaPic':     false,
        'imagesPack':   './images/crwidget/simple-flags/'  
    },
    
    'content': {
        'date': {},
        'valute': {}
    },

    'elements': {},

    /**
     * Метод инициализации виджета
     * 
     * @param {Array} options массив пользовательских настроек
     */
    init: function(options) {
        try {

            /** Установка пользователских опций */
            if (options) {
                for (key in options) {
                    if (key in this.options) this.options[key] = options[key];
                }
            }

            this.request();

            /** Проверяем существование элемента родителя для виджета */
            if (document.getElementById(this.options['container'])) {
                                
                /** Генерируем элемент Виджет */
                this.elements['main'] = document.createElement('div');
                this.elements['main'].setAttribute('id', this.options['id']+'_main');
                this.elements['main'].setAttribute('container', this.options['container']);
                this.elements['main'].setAttribute('class', 'crwidget_main');

                /** Генерируем элементы Заголовков */
                this.setElement('headers', 'main', 'headers', '');
                this.setElement('label', 'headers', 'label', 'Курсы валют');
                for (key in this.content['date']) {
                    this.setElement(key, 'headers', 'label', this.content['date'][key]);
                }

                /** Генерируем элементы Курса валют */
                for (key in this.content['valute']) {
                    var visible = false;
                    for (var i = 0; i < this.options['favorite'].length; i++) {
                        if (this.options['favorite'][i] == key) visible = true;
                    };

                    if (visible == true) {
                        this.setElement(key, 'main', 'valute', '');
                    } else {
                        this.setElement(key, 'main', 'valute__disabled', '');
                    }
                    this.setElement(key+'_pic', key, 'picture', '<img src="'+this.options['imagesPack']+key+'.png"></img>');
                    this.setElement(key+'_code', key, 'label', this.formatValuteCode(key)); 
                    this.setElement(key+'_previous', key, 'value', this.formatValutePrevious(key)); 
                    this.setElement(key+'_value', key, 'value', this.formatValuteValue(key));
                    
                    this.elements[key+'_pic'].setAttribute('title', this.content['valute'][key]['name']);
                    this.elements[key+'_code'].setAttribute('title', this.content['valute'][key]['name']);
                };

                //** Генерируем ссылку на проект API */
                this.setElement('backlink', 'main', 'backlink__disabled', '<a href="https://www.cbr-xml-daily.ru/">API для курсов ЦБ РФ</a>');

                //** Генерируем кнопку отображения курсов валют */
                this.setElement('btnView', 'main',  'btnView', '<span>Все показатели</span>');
                this.elements['btnView'].addEventListener('click', this.actionViewAll.bind(this));
                
                
                /** Добавляем все элементы в DOM дерево документа */
                this.insertStyle();
                for (key in this.elements){
                    this.insertElement(this.elements[key]);
                }
                
            } else {
                console.log(['Init widget ID:', this.options['id'], '\n Отстутсвует контейнер', this.options['container'], 'для виджета.'].join(' '));
            }
            
        } catch(error) {
            console.log(['Init widget ID:', this.options['id'], '\n', error.stack].join(' '));
        }
    },

    /**
     * Метод загружает данные курса валют API/Local Storage
     */
    request: function() {
        try {
    
            /**
            * Загружаем данные в объект
            */
            var xhr = new XMLHttpRequest();
            xhr.open('GET', this._urlAPI, false);
            xhr.send();
            var data = JSON.parse(xhr.responseText);
            if (data) {

                /** Устанвка контента даты */
                this.content['date'] = {
                    'previous': this.formatDate(data.PreviousDate),
                    'now': this.formatDate(data.Date)
                };

                /** Установка контента валют */
                for (key in data.Valute) {
                    this.content['valute'][key] = {
                        'id': data.Valute[key].ID,
                        'numCode': data.Valute[key].NumCode,
                        'charCode': data.Valute[key].CharCode,
                        'nominal': data.Valute[key].Nominal,
                        'name': data.Valute[key].Name,
                        'value': data.Valute[key].Value,
                        'previous': data.Valute[key].Previous 
                    };
                }

            }
        
        } catch(error) {
            console.log(['Request widget id:', this.options['id'], '\n', error.stack].join(' '));
        }
    },
   
    /**
     * Метод возвращает актуальность хранимых данных
     * 
     * @param {string} key ключ к данным по курсам валют в LocalStorage
     * @returns bool
     */
    isActualData: function(key) {
        try {

            if (localStorage.getItem(key) == null) return false;
            if (localStorage.getItem(key) == undefined) return false;
            if (localStorage.getItem(key) == 'undefined') return false;
            if (this.formatDate(JSON.parse(localStorage.getItem(key)).Date) != this.formatDate(Date())) return false;
            
            return true;

        } catch(error) {
            return false;
        }
    },

    /**
    * Метод для форматирования даты
    * 
    * @param {string} str строка с датой и временем;
    * @returns string в формате dd.mm.yyyy;
    */
    formatDate: function(str) {
        var format;
    
        /** Парсинг строки с датой */
        var time = new Date(Date.parse(str)).getTime();
        var date = new Date(time);
        
        /** Хранение дня, месяца и даты */
        var day = date.getDate();
        var month = date.getMonth()+1;
        var year = date.getFullYear();
    
        /** Корректировка количества знаков */
        if (day.toString().length == 1) day = '0' + day.toString();
        if (month.toString().length == 1) month = '0' + month.toString();
    
        format = day+'&nbsp;.&nbsp;'+month+'&nbsp;.&nbsp;'+year;
    
        return format;
    },

    /**
     * Метод форматирует вывод кода валюты
     * 
     * @param {String} valuteKey ключ контента к валюте
     * @returns string
     */
    formatValuteCode: function(valuteKey) {
        var str;
        var valute = this.content['valute'][valuteKey];

        if (this.options['deltaPic'] == true) {
            if (valute['value'] > valute['previous']) {
                str = valute['charCode'] + '  <span class="long">▲</span>';
            } else if (valute['value'] < valute['previous']) {
                str = valute['charCode'] + '  <span class="short">▼</span>'
            } else {
                str = valute['charCode'];
            }
        } else {
            str = valute['charCode'];
        }
    
        return str;    
    },

    /**
     * Метод форматирует вывод прошлого значения курса валюты 
     * 
     * @param {String} valuteKey ключ контента к валюте
     * @returns string
     */
    formatValutePrevious: function(valuteKey) {
        var str;
        var valute = this.content['valute'][valuteKey];

        if (this.options['fullValue'] == true) {
            str = valute['previous'].toString();
            if (str.slice(str.indexOf('.')+1).length != 4) {
                str = str + '0';
            }
        } else {
            str = valute['previous'].toFixed(2);
        }
    
        return str.replace('.', ',&nbsp;') + '&nbsp;' + String.fromCharCode(8381);
    },

    /**
     * Метод форматирует вывод текущего значения курса валюты 
     * 
     * @param {String} valuteKey ключ контента к валюте
     * @returns string
     */
    formatValuteValue: function(valuteKey) {
        var str;
        var valute = this.content['valute'][valuteKey];

        if (this.options['fullValue'] == true) {
            str = valute['value'].toString();
            if (str.slice(str.indexOf('.')+1).length != 4) {
                str = str + '0';
            }
        } else {
            str = valute['value'].toFixed(2);
        }
    
        return str.replace('.', ',&nbsp;') + '&nbsp;' + String.fromCharCode(8381);
    },

    /**
     * Метод устанавливает новый DOM элемент
     * 
     * @param {String} id идентификатор элемента
     * @param {String} containerId контейнер расположения элемента
     * @param {String} className класс стилей элемента
     * @param {String} content содержимое элемента
     */
    setElement: function(id, containerId, className, content) {
        this.elements[id] = document.createElement('div');
        this.elements[id].setAttribute('id', this.options['id']+'_'+id);
        this.elements[id].setAttribute('class', 'crwidget_'+className);
        this.elements[id].setAttribute('container', 'crwidget_'+containerId);
        this.elements[id].innerHTML = content;
    },

    /**
     * Метод создаёт элемент стилей и добаляет в HEAD документа;
     */
     insertStyle: function() {
        var linkSetted = false;
    
        var links = document.getElementsByTagName('link');
        for (var i = 0; i < links.length; i++) {
            if (links[i].href.indexOf(this._urlStyle.slice(2)) != -1) linkSetted = true;
        };
    
        if (linkSetted == false) {
            style = document.createElement('link'); 
            style.rel = 'stylesheet'; 
            style.type = 'text/css'; 
            style.href = this._urlStyle; 
            document.head.appendChild(style); 
        };    
    },

    /**
     * Метод размещает элемент в контейнере
     * 
     * @param {Object} element объект DOM
     */
    insertElement: function(element) {
        var container = document.getElementById(element.getAttribute('container'));
        container.insertAdjacentElement('beforeend', element);  
    },

    /**
     * Метод действия отображает весь список валют
     */
    actionViewAll: function() {

        /** Для всех элементов Валют устанавливаем класс стиля widget_valute {};  */
        for (key in this.content['valute']) {
            this.elements[key].setAttribute('class', 'crwidget_valute');
        }

        /** Для элемента ссылки на проект API устанавливаем класс стиля widget_backlink {};  */
        this.elements['backlink'].setAttribute('class', 'crwidget_backlink');        
        
        /** Меняем обработчик; */
        this.elements['btnView'].removeEventListener('click', this.actionViewAll);
        this.elements['btnView'].addEventListener('click', this.actionViewFavorite.bind(this));
        this.elements['btnView'].innerHTML = '<span>Избранные показатели</span>';

    },

    /**
     * Метод действия отображает только избранные валюты
     */
    actionViewFavorite: function() {
        /** Для всех элементов Валют, кроме избранных устанавливаем класс стиля widget_valute__disabled {};  */
        for (key in this.content['valute']) {
            var visible = false;
            for (var i = 0; i < this.options['favorite'].length; i++) {
                if (this.options['favorite'][i] == key) visible = true;
            };
            if (visible == true){
                this.elements[key].setAttribute('class', 'crwidget_valute');
            } else {
                this.elements[key].setAttribute('class', 'crwidget_valute__disabled');
            }
        }
        /** Для элемента ссылки на проект API устанавливаем класс стиля widget_backlink__disabled {};  */
        this.elements['backlink'].setAttribute('class', 'crwidget_backlink__disabled');    

        /** Меняем обработчик; */
        this.elements['btnView'].removeEventListener('click', this.actionViewFavorite);
        this.elements['btnView'].addEventListener('click', this.actionViewAll.bind(this));
        this.elements['btnView'].innerHTML = '<span>Все показатели</span>';
    }
};