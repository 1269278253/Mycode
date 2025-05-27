document.addEventListener('DOMContentLoaded', () => {
    // 游戏主类
    class Game2048 {
        constructor() {
            this.gridSize = 4; // 4x4网格
            this.grid = [];
            this.score = 0;
            this.gameOver = false;
            this.won = false;
            this.tileContainer = document.querySelector('.tile-container');
            this.scoreDisplay = document.getElementById('score');
            this.gameMessage = document.querySelector('.game-message');
            this.messageText = document.querySelector('.game-message p');
            
            // 初始化游戏
            this.init();
            
            // 设置事件监听器
            this.setupEventListeners();
        }
        
        // 初始化游戏
        init() {
            // 清空网格
            this.grid = [];
            for (let i = 0; i < this.gridSize; i++) {
                this.grid[i] = [];
                for (let j = 0; j < this.gridSize; j++) {
                    this.grid[i][j] = 0;
                }
            }
            
            // 重置分数
            this.score = 0;
            this.updateScore();
            
            // 重置游戏状态
            this.gameOver = false;
            this.won = false;
            
            // 清空方块容器
            this.tileContainer.innerHTML = '';
            
            // 隐藏游戏消息
            this.gameMessage.classList.remove('game-over');
            
            // 添加初始方块
            this.addRandomTile();
            this.addRandomTile();
        }
        
        // 设置事件监听器
        setupEventListeners() {
            // 键盘事件
            document.addEventListener('keydown', (e) => {
                if (this.gameOver) return;
                
                // 方向键和WASD
                switch(e.key) {
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                        this.move('up');
                        e.preventDefault();
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        this.move('right');
                        e.preventDefault();
                        break;
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                        this.move('down');
                        e.preventDefault();
                        break;
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        this.move('left');
                        e.preventDefault();
                        break;
                }
            });
            
            // 新游戏按钮
            document.getElementById('new-game').addEventListener('click', () => {
                this.init();
            });
            
            // 重试按钮
            document.querySelector('.retry-button').addEventListener('click', () => {
                this.init();
            });
            
            // 添加触摸滑动支持
            let touchStartX, touchStartY, touchEndX, touchEndY;
            
            document.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }, false);
            
            document.addEventListener('touchend', (e) => {
                if (this.gameOver) return;
                
                touchEndX = e.changedTouches[0].clientX;
                touchEndY = e.changedTouches[0].clientY;
                
                const dx = touchEndX - touchStartX;
                const dy = touchEndY - touchStartY;
                
                // 确定滑动方向
                if (Math.abs(dx) > Math.abs(dy)) {
                    // 水平滑动
                    if (dx > 0) {
                        this.move('right');
                    } else {
                        this.move('left');
                    }
                } else {
                    // 垂直滑动
                    if (dy > 0) {
                        this.move('down');
                    } else {
                        this.move('up');
                    }
                }
                
                e.preventDefault();
            }, false);
        }
        
        // 添加随机方块
        addRandomTile() {
            // 找出所有空位置
            const emptyPositions = [];
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    if (this.grid[i][j] === 0) {
                        emptyPositions.push({x: i, y: j});
                    }
                }
            }
            
            // 如果没有空位置，返回
            if (emptyPositions.length === 0) return;
            
            // 随机选择一个空位置
            const position = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
            
            // 90%概率生成2，10%概率生成4
            const value = Math.random() < 0.9 ? 2 : 4;
            
            // 更新网格
            this.grid[position.x][position.y] = value;
            
            // 创建方块元素
            this.createTileElement(position.x, position.y, value);
        }
        
        // 创建方块元素
        createTileElement(x, y, value) {
            const tile = document.createElement('div');
            tile.className = `tile tile-${value} tile-position-${x}-${y} tile-new`;
            tile.textContent = value;
            tile.style.top = `${15 + x * 115}px`;
            tile.style.left = `${15 + y * 115}px`;
            
            // 响应式调整
            if (window.innerWidth <= 520) {
                tile.style.top = `${10 + x * 80}px`;
                tile.style.left = `${10 + y * 80}px`;
            }
            
            this.tileContainer.appendChild(tile);
        }
        
        // 更新方块位置
        updateTilePosition(x, y, newX, newY, value) {
            // 找到对应的方块元素
            const tiles = document.querySelectorAll(`.tile-position-${x}-${y}`);
            if (tiles.length === 0) return;
            
            const tile = tiles[0];
            
            // 更新类名和位置
            tile.className = `tile tile-${value} tile-position-${newX}-${newY}`;
            tile.textContent = value;
            tile.style.top = `${15 + newX * 115}px`;
            tile.style.left = `${15 + newY * 115}px`;
            
            // 响应式调整
            if (window.innerWidth <= 520) {
                tile.style.top = `${10 + newX * 80}px`;
                tile.style.left = `${10 + newY * 80}px`;
            }
        }
        
        // 移除方块元素
        removeTileElement(x, y) {
            const tiles = document.querySelectorAll(`.tile-position-${x}-${y}`);
            if (tiles.length === 0) return;
            
            tiles.forEach(tile => {
                this.tileContainer.removeChild(tile);
            });
        }
        
        // 更新分数
        updateScore() {
            this.scoreDisplay.textContent = this.score;
        }
        
        // 移动方块
        move(direction) {
            // 保存移动前的网格状态
            const previousGrid = JSON.parse(JSON.stringify(this.grid));
            
            // 根据方向移动
            let moved = false;
            
            switch(direction) {
                case 'up':
                    moved = this.moveUp();
                    break;
                case 'right':
                    moved = this.moveRight();
                    break;
                case 'down':
                    moved = this.moveDown();
                    break;
                case 'left':
                    moved = this.moveLeft();
                    break;
            }
            
            // 如果有移动，添加新方块
            if (moved) {
                this.addRandomTile();
                
                // 检查游戏状态
                this.checkGameState();
            }
        }
        
        // 向上移动
        moveUp() {
            let moved = false;
            
            // 清空方块容器，稍后重新创建所有方块
            this.tileContainer.innerHTML = '';
            
            for (let j = 0; j < this.gridSize; j++) {
                // 处理每一列
                let column = [];
                for (let i = 0; i < this.gridSize; i++) {
                    if (this.grid[i][j] !== 0) {
                        column.push(this.grid[i][j]);
                    }
                }
                
                // 合并相同的数字
                for (let i = 0; i < column.length - 1; i++) {
                    if (column[i] === column[i + 1]) {
                        column[i] *= 2;
                        column[i + 1] = 0;
                        this.score += column[i];
                        
                        // 检查是否达到2048
                        if (column[i] === 2048 && !this.won) {
                            this.won = true;
                            this.showMessage('你赢了!');
                        }
                    }
                }
                
                // 移除0
                column = column.filter(value => value !== 0);
                
                // 填充0
                while (column.length < this.gridSize) {
                    column.push(0);
                }
                
                // 更新网格
                for (let i = 0; i < this.gridSize; i++) {
                    if (this.grid[i][j] !== column[i]) {
                        moved = true;
                    }
                    this.grid[i][j] = column[i];
                    
                    // 如果有值，创建方块元素
                    if (this.grid[i][j] !== 0) {
                        this.createTileElement(i, j, this.grid[i][j]);
                    }
                }
            }
            
            // 更新分数
            this.updateScore();
            
            return moved;
        }
        
        // 向右移动
        moveRight() {
            let moved = false;
            
            // 清空方块容器，稍后重新创建所有方块
            this.tileContainer.innerHTML = '';
            
            for (let i = 0; i < this.gridSize; i++) {
                // 处理每一行
                let row = this.grid[i].slice();
                
                // 移除0
                row = row.filter(value => value !== 0);
                
                // 合并相同的数字
                for (let j = row.length - 1; j > 0; j--) {
                    if (row[j] === row[j - 1]) {
                        row[j] *= 2;
                        row[j - 1] = 0;
                        this.score += row[j];
                        
                        // 检查是否达到2048
                        if (row[j] === 2048 && !this.won) {
                            this.won = true;
                            this.showMessage('你赢了!');
                        }
                    }
                }
                
                // 移除0
                row = row.filter(value => value !== 0);
                
                // 填充0
                while (row.length < this.gridSize) {
                    row.unshift(0);
                }
                
                // 更新网格
                for (let j = 0; j < this.gridSize; j++) {
                    if (this.grid[i][j] !== row[j]) {
                        moved = true;
                    }
                    this.grid[i][j] = row[j];
                    
                    // 如果有值，创建方块元素
                    if (this.grid[i][j] !== 0) {
                        this.createTileElement(i, j, this.grid[i][j]);
                    }
                }
            }
            
            // 更新分数
            this.updateScore();
            
            return moved;
        }
        
        // 向下移动
        moveDown() {
            let moved = false;
            
            // 清空方块容器，稍后重新创建所有方块
            this.tileContainer.innerHTML = '';
            
            for (let j = 0; j < this.gridSize; j++) {
                // 处理每一列
                let column = [];
                for (let i = 0; i < this.gridSize; i++) {
                    if (this.grid[i][j] !== 0) {
                        column.push(this.grid[i][j]);
                    }
                }
                
                // 合并相同的数字
                for (let i = column.length - 1; i > 0; i--) {
                    if (column[i] === column[i - 1]) {
                        column[i] *= 2;
                        column[i - 1] = 0;
                        this.score += column[i];
                        
                        // 检查是否达到2048
                        if (column[i] === 2048 && !this.won) {
                            this.won = true;
                            this.showMessage('你赢了!');
                        }
                    }
                }
                
                // 移除0
                column = column.filter(value => value !== 0);
                
                // 填充0
                while (column.length < this.gridSize) {
                    column.unshift(0);
                }
                
                // 更新网格
                for (let i = 0; i < this.gridSize; i++) {
                    if (this.grid[i][j] !== column[i]) {
                        moved = true;
                    }
                    this.grid[i][j] = column[i];
                    
                    // 如果有值，创建方块元素
                    if (this.grid[i][j] !== 0) {
                        this.createTileElement(i, j, this.grid[i][j]);
                    }
                }
            }
            
            // 更新分数
            this.updateScore();
            
            return moved;
        }
        
        // 向左移动
        moveLeft() {
            let moved = false;
            
            // 清空方块容器，稍后重新创建所有方块
            this.tileContainer.innerHTML = '';
            
            for (let i = 0; i < this.gridSize; i++) {
                // 处理每一行
                let row = this.grid[i].slice();
                
                // 移除0
                row = row.filter(value => value !== 0);
                
                // 合并相同的数字
                for (let j = 0; j < row.length - 1; j++) {
                    if (row[j] === row[j + 1]) {
                        row[j] *= 2;
                        row[j + 1] = 0;
                        this.score += row[j];
                        
                        // 检查是否达到2048
                        if (row[j] === 2048 && !this.won) {
                            this.won = true;
                            this.showMessage('你赢了!');
                        }
                    }
                }
                
                // 移除0
                row = row.filter(value => value !== 0);
                
                // 填充0
                while (row.length < this.gridSize) {
                    row.push(0);
                }
                
                // 更新网格
                for (let j = 0; j < this.gridSize; j++) {
                    if (this.grid[i][j] !== row[j]) {
                        moved = true;
                    }
                    this.grid[i][j] = row[j];
                    
                    // 如果有值，创建方块元素
                    if (this.grid[i][j] !== 0) {
                        this.createTileElement(i, j, this.grid[i][j]);
                    }
                }
            }
            
            // 更新分数
            this.updateScore();
            
            return moved;
        }
        
        // 检查游戏状态
        checkGameState() {
            // 检查是否还有空位置
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    if (this.grid[i][j] === 0) {
                        return; // 还有空位置，游戏继续
                    }
                }
            }
            
            // 检查是否还有可以合并的方块
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    // 检查右侧
                    if (j < this.gridSize - 1 && this.grid[i][j] === this.grid[i][j + 1]) {
                        return; // 可以合并，游戏继续
                    }
                    
                    // 检查下方
                    if (i < this.gridSize - 1 && this.grid[i][j] === this.grid[i + 1][j]) {
                        return; // 可以合并，游戏继续
                    }
                }
            }
            
            // 没有空位置且没有可以合并的方块，游戏结束
            this.gameOver = true;
            this.showMessage('游戏结束!');
        }
        
        // 显示游戏消息
        showMessage(message) {
            this.messageText.textContent = message;
            this.gameMessage.classList.add('game-over');
        }
    }
    
    // 创建游戏实例
    const game = new Game2048();
});