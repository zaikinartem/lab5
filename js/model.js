$(document).ready(function() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    $('#currentDate').text(formattedDate);
    
    let shapes = []; 
    let animationInterval = null;
    let hiddenShapeData = null; 
    let currentShapeId = null; 
    
    const colors = {
        red: '#ff4444',
        green: '#44ff44',
        blue: '#4444ff',
        yellow: '#ffff44',
        purple: '#aa44ff'
    };
    
    const colorNames = {
        red: 'Красный',
        green: 'Зеленый',
        blue: 'Синий',
        yellow: 'Желтый',
        purple: 'Фиолетовый'
    };
    
    const shapeTypes = ['circle', 'square', 'triangle'];
    const shapeNames = {
        circle: 'Круг',
        square: 'Квадрат',
        triangle: 'Треугольник'
    };
    
    /**
     * Функция получения случайного числа
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    /**
     * Функция получения случайного цвета
     * @param {String} colorFilter
     * @returns {{code: string, name: string}}
     */
    function getRandomColor(colorFilter = 'all') {
        const colorKeys = Object.keys(colors);
        let availableColors = colorKeys;
        
        if (colorFilter !== 'all') {
            availableColors = colorKeys.filter(c => c === colorFilter);
        }
        
        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        return {
            code: colors[randomColor],
            name: colorNames[randomColor]
        };
    }
    
    /**
     * Функция получения случайной формы
     * @param {String} shapeFilter
     * @returns {String}
     */
    function getRandomShape(shapeFilter = 'all') {
        let availableShapes = shapeTypes;
        
        if (shapeFilter !== 'all') {
            if (shapeFilter === 'circle') availableShapes = ['circle'];
            else if (shapeFilter === 'square') availableShapes = ['square'];
            else if (shapeFilter === 'triangle') availableShapes = ['triangle'];
        }
        
        const randomShape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
        return randomShape;
    }
    
    /**
     * Создание элемента фигуры
     * @param {Object} shapeData
     * @param {Number} id
     * @returns {jQuery}
     */
    function createShapeElement(shapeData, id) {
        const $shape = $('<div>').addClass('shape').addClass(shapeData.type);
        const size = 50;
        
        if (shapeData.type !== 'triangle') {
            $shape.css({
                width: size + 'px',
                height: size + 'px',
                backgroundColor: shapeData.color.code,
                left: shapeData.x + 'px',
                top: shapeData.y + 'px'
            });
        } else {
            $shape.css({
                left: shapeData.x + 'px',
                top: shapeData.y + 'px',
                borderBottomColor: shapeData.color.code,
                borderLeftWidth: (size/2) + 'px',
                borderRightWidth: (size/2) + 'px',
                borderBottomWidth: size + 'px'
            });
        }
        
        $shape.attr('data-id', id);
        $shape.attr('data-type', shapeData.type);
        $shape.attr('data-color', shapeData.color.name);
        
        return $shape;
    }
    
    /**
     * Генерация фигур
     * @returns {Void}
     */
    function generateShapes() {
        if (animationInterval) {
            clearInterval(animationInterval);
        }
        
        $('#animationArea').empty();
        shapes = [];
        
        const count = parseInt($('#shapeCount').val());
        const shapeFilter = $('#shapeTypeSelect').val();
        const colorFilter = $('#colorSelect').val();
        
        if (isNaN(count) || count < 1) {
            alert('Пожалуйста, введите корректное количество фигур (от 1 до 15)');
            return;
        }
        
        const areaWidth = $('#animationArea').width();
        const areaHeight = $('#animationArea').height();
        
        for (let i = 0; i < count; i++) {
            const shapeData = {
                id: i,
                x: random(20, areaWidth - 70),
                y: random(20, areaHeight - 70),
                dx: random(1, 4) * (Math.random() > 0.5 ? 1 : -1),
                dy: random(1, 4) * (Math.random() > 0.5 ? 1 : -1),
                type: getRandomShape(shapeFilter),
                color: getRandomColor(colorFilter)
            };
            
            shapes.push(shapeData);
        }
        
        shapes.forEach(shape => {
            const $shape = createShapeElement(shape, shape.id);
            $('#animationArea').append($shape);
        });
        
        startAnimation();
    }
    
    /**
     * Запускает анимацию движения фигур
     * @returns {Void}
     */
    function startAnimation() {
        if (animationInterval) {
            clearInterval(animationInterval);
        }
        
        animationInterval = setInterval(() => {
            const areaWidth = $('#animationArea').width();
            const areaHeight = $('#animationArea').height();
            
            shapes.forEach(shape => {
                shape.x += shape.dx;
                shape.y += shape.dy;
                
                const size = 50;
                if (shape.type === 'triangle') {
                    if (shape.x <= 0 || shape.x + 30 >= areaWidth) shape.dx *= -1;
                    if (shape.y <= 0 || shape.y + size >= areaHeight) shape.dy *= -1;
                } else {
                    if (shape.x <= 0 || shape.x + size >= areaWidth) shape.dx *= -1;
                    if (shape.y <= 0 || shape.y + size >= areaHeight) shape.dy *= -1;
                }
                
                const $shape = $(`.shape[data-id='${shape.id}']`);
                if ($shape.length && $shape.is(':visible')) {
                    $shape.css({
                        left: shape.x + 'px',
                        top: shape.y + 'px'
                    });
                }
            });
        }, 20);
    }
    
    $('#animationArea').on('click', '.shape', function() {
        const $shape = $(this);
        const shapeId = parseInt($shape.attr('data-id'));
        const shapeType = $shape.attr('data-type');
        const shapeColor = $shape.attr('data-color');
        
        hiddenShapeData = {
            id: shapeId,
            type: shapeType,
            color: shapeColor
        };
        currentShapeId = shapeId;
        
        $shape.hide();
        
        updateInfoPanel(shapeType, shapeColor);
    });
    
    /**
     * Обновляет панель информации о скрытой фигуре
     * @param {String} type
     * @param {String} color
     * @returns {Void}
     */
    function updateInfoPanel(type, color) {
        const typeName = shapeNames[type] || type;
        
        const infoHtml = `
            <div class="hidden-info">
                <div class="info-text">
                     Скрыта фигура: <span>${typeName}</span>, цвет: <span>${color}</span>
                </div>
                <button class="restore-btn"> Восстановить фигуру</button>
            </div>
        `;
        
        $('#hiddenInfoPanel').html(infoHtml);
        
        $('.restore-btn').click(function() {
            restoreShape();
        });
    }
    
    /**
     * Восстанавливает скрытую фигуру
     * @returns {Void}
     */
    function restoreShape() {
        if (currentShapeId !== null) {
            const $shape = $(`.shape[data-id='${currentShapeId}']`);
            
            if ($shape.length && $shape.is(':hidden')) {
                $shape.show();
                
                $('#hiddenInfoPanel').html(`
                    <div class="placeholder-text">
                         Фигура восстановлена! Нажмите на другую фигуру, чтобы скрыть её
                    </div>
                `);
                
                hiddenShapeData = null;
                currentShapeId = null;
            }
        }
    }
    
    /**
     * Полностью очищает рабочую область
     * @returns {Void}
     */
    function clearAll() {
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
        $('#animationArea').empty();
        shapes = [];
        $('#hiddenInfoPanel').html(`
            <div class="placeholder-text">
                 Нажмите на любую фигуру, чтобы скрыть её
            </div>
        `);
        hiddenShapeData = null;
        currentShapeId = null;
    }
    
    $('#generateBtn').click(function() {
        if (hiddenShapeData) {
            $('#hiddenInfoPanel').html(`
                <div class="placeholder-text">
                     Нажмите на любую фигуру, чтобы скрыть её
                </div>
            `);
            hiddenShapeData = null;
            currentShapeId = null;
        }
        generateShapes();
    });
    
    $('#clearBtn').click(function() {
        clearAll();
    });
    
    $(window).resize(function() {   
        if (shapes.length > 0) {
            generateShapes();
        }
    });
    
    generateShapes();
});