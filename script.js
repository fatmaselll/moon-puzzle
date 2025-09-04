// Menü geçişleri (span)
document.getElementById('spanHome').onclick = (e) => { e.preventDefault && e.preventDefault(); showGallery(); };
document.getElementById('spanCustom').onclick = (e) => {
    e.preventDefault && e.preventDefault();
    gallerySection.style.display = 'none';
    customSection.style.display = '';
    puzzleMain.style.display = 'none';
    imagePreview.style.display = 'none';
};

// Galeri ve özel puzzle bölümü için
const gallerySection = document.getElementById('gallerySection');
const gallery = document.getElementById('gallery');
const customPuzzleBtn = document.getElementById('customPuzzleBtn');
const customSection = document.getElementById('customSection');
const backToGallery = document.getElementById('backToGallery');
const puzzleMain = document.getElementById('puzzleMain');
const backToHome = document.getElementById('backToHome');
const puzzlePreview = document.getElementById('puzzlePreview');

const imageInput = document.getElementById('imageInput');
const pieceCountSelect = document.getElementById('pieceCount');
const startBtn = document.getElementById('startBtn');
const puzzleArea = document.getElementById('puzzleArea');
const piecesArea = document.getElementById('piecesArea');
const imagePreview = document.getElementById('imagePreview');

let image = null;
let pieceCount = 10;
let size = 3;
let pieceWidth = 0;
let pieceHeight = 0;
let currentPuzzleSrc = null;
let isCustom = false;

// Galeri fotoğrafları (statik olarak ekleniyor, dinamik için sunucu gerekir)
const galleryPhotos = [
    'fotograflar/1.jpg',
    'fotograflar/2.jpg',
    'fotograflar/3.jpg',
    'fotograflar/4.jpg',
    'fotograflar/5.jpg',
    'fotograflar/6.jpg',
    'fotograflar/7.jpg',
];

function showGallery() {
    gallery.innerHTML = '';
    galleryPhotos.forEach(src => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Galeri Fotoğrafı';
        card.appendChild(img);
        card.onclick = () => startGalleryPuzzle(src);
        gallery.appendChild(card);
    });
    gallerySection.style.display = '';
    customSection.style.display = 'none';
    puzzleMain.style.display = 'none';
}

function startGalleryPuzzle(src) {
    isCustom = false;
    currentPuzzleSrc = src;
    pieceCount = parseInt(pieceCountSelect.value);
    // Küçük önizleme göster
    puzzlePreview.src = src;
    puzzlePreview.style.display = 'block';
    // Puzzle başlat
    image = new window.Image();
    image.src = src;
    image.onload = () => {
        puzzleMain.style.display = '';
        gallerySection.style.display = 'none';
        customSection.style.display = 'none';
        createPuzzle();
    };
}

customPuzzleBtn && customPuzzleBtn.addEventListener('click', () => {
    gallerySection.style.display = 'none';
    customSection.style.display = '';
    puzzleMain.style.display = 'none';
    imagePreview.style.display = 'none';
});

backToGallery && backToGallery.addEventListener('click', () => {
    showGallery();
});

backToHome && backToHome.addEventListener('click', () => {
    showGallery();
});

// Sayfa açılışında galeri göster
showGallery();

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            image = new Image();
            image.src = event.target.result;
            isCustom = true;
            currentPuzzleSrc = event.target.result;
            // Önizleme göster
            imagePreview.src = event.target.result;
            imagePreview.style.display = 'block';
            imagePreview.classList.add('animate-preview');
            setTimeout(() => imagePreview.classList.remove('animate-preview'), 800);
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = 'none';
    }
});

pieceCountSelect.addEventListener('change', (e) => {
    pieceCount = parseInt(e.target.value);
});

startBtn.addEventListener('click', () => {
    if (!image) {
        alert('Lütfen bir fotoğraf seçin!');
        return;
    }
    // Küçük önizleme göster
    puzzlePreview.src = currentPuzzleSrc;
    puzzlePreview.style.display = 'block';
    puzzleMain.style.display = '';
    gallerySection.style.display = 'none';
    customSection.style.display = 'none';
    createPuzzle();
});

function createPuzzle() {
    // Temizle
    puzzleArea.innerHTML = '';
    piecesArea.innerHTML = '';
    size = Math.round(Math.sqrt(pieceCount));

    // Fotoğraf oranına göre puzzle alanı boyutunu ayarla
    let maxPuzzleWidth = Math.min(window.innerWidth * 0.8, 900);
    let maxPuzzleHeight = Math.min(window.innerHeight * 0.5, 600);
    let imgRatio = image.width / image.height;
    let puzzleWidth = maxPuzzleWidth;
    let puzzleHeight = Math.round(puzzleWidth / imgRatio);
    if (puzzleHeight > maxPuzzleHeight) {
        puzzleHeight = maxPuzzleHeight;
        puzzleWidth = Math.round(puzzleHeight * imgRatio);
    }
    puzzleArea.style.width = puzzleWidth + 'px';
    puzzleArea.style.height = puzzleHeight + 'px';
    puzzleArea.style.maxWidth = '90vw';
    puzzleArea.style.maxHeight = '60vh';
    piecesArea.style.width = puzzleWidth + 'px';
    piecesArea.style.maxWidth = '90vw';

    puzzleArea.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    puzzleArea.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    // Parça boyutları sabit
    const pieceW = Math.floor(puzzleWidth / size);
    const pieceH = Math.floor(puzzleHeight / size);

    image.onload = () => {
        pieceWidth = Math.floor(image.width / size);
        pieceHeight = Math.floor(image.height / size);
        const pieces = [];
        // Parçaları oluştur
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                pieces.push({x, y, index: y * size + x});
            }
        }
        // Canvas ile kare parçalar oluştur
        const pieceImages = pieces.map(({x, y}) => {
            const canvas = document.createElement('canvas');
            canvas.width = pieceW;
            canvas.height = pieceH;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(
                image,
                x * pieceWidth, y * pieceHeight, pieceWidth, pieceHeight,
                0, 0, canvas.width, canvas.height
            );
            return canvas.toDataURL();
        });
        // Puzzle alanını boş karelerle doldur
        for (let i = 0; i < pieces.length; i++) {
            const div = document.createElement('div');
            div.className = 'puzzle-piece';
            div.style.width = pieceW + 'px';
            div.style.height = pieceH + 'px';
            div.dataset.index = i;
            div.dataset.filled = '';
            div.ondragover = (e) => e.preventDefault();
            div.ondrop = (e) => onDropPiece(e, div);
            div.ondragstart = (e) => {
                // Puzzle alanındaki parça yanlışsa veya doğruysa tekrar sürüklenebilir
                if (div.firstChild && div.firstChild.dataset) {
                    e.dataTransfer.setData('pieceIndex', div.firstChild.dataset.index);
                    piecesArea.appendChild(div.firstChild);
                    div.dataset.filled = '';
                }
            };
            // Puzzle kutusuna başka bir puzzle parçası da bırakılabilsin
            div.ondragover = (e) => e.preventDefault();
            div.ondrop = (e) => onDropPiece(e, div);
            puzzleArea.appendChild(div);
        }
        // Parçaları karıştır ve aşağıya ekle
        const shuffled = pieces.map((p, i) => i);
        shuffleArray(shuffled);
        for (let i = 0; i < shuffled.length; i++) {
            const idx = shuffled[i];
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'puzzle-piece';
            pieceDiv.style.width = pieceW + 'px';
            pieceDiv.style.height = pieceH + 'px';
            pieceDiv.style.backgroundImage = `url(${pieceImages[idx]})`;
            pieceDiv.setAttribute('draggable', 'true');
            pieceDiv.dataset.index = idx;
            pieceDiv.ondragstart = (e) => {
                e.dataTransfer.setData('pieceIndex', idx);
            };
            // Parça alanındaki parçalar da tekrar sürüklenebilir
            pieceDiv.ondragover = (e) => e.preventDefault();
            pieceDiv.ondrop = (e) => {
                // Eğer başka bir parça bırakılırsa, onu da parça alanına ekle
                const idx2 = e.dataTransfer.getData('pieceIndex');
                if (idx2 && idx2 !== idx) {
                    let fromPuzzle = Array.from(puzzleArea.children).find(div => div.firstChild && div.firstChild.dataset && div.firstChild.dataset.index == idx2);
                    if (fromPuzzle && fromPuzzle.firstChild) {
                        piecesArea.appendChild(fromPuzzle.firstChild);
                        fromPuzzle.dataset.filled = '';
                    }
                    // Parça alanındaki başka bir parçayı da yer değiştirebiliriz
                    let fromPieces = Array.from(piecesArea.children).find(div => div.dataset.index == idx2);
                    if (fromPieces && fromPieces !== pieceDiv) {
                        piecesArea.appendChild(fromPieces);
                    }
                }
            };
            piecesArea.appendChild(pieceDiv);
        }
    };
    if (image.complete) image.onload();
}

function onDropPiece(e, targetDiv) {
    const idx = e.dataTransfer.getData('pieceIndex');
    if (!targetDiv.dataset.filled) {
        // Parçayı bul ve ekle
        let piece = Array.from(piecesArea.children).find(div => div.dataset.index == idx);
        // Eğer parça parça alanında yoksa, puzzle alanında olabilir
        if (!piece) {
            piece = Array.from(targetDiv.parentElement.children).find(div => div.firstChild && div.firstChild.dataset && div.firstChild.dataset.index == idx);
            if (piece && piece.firstChild) {
                piece = piece.firstChild;
            } else {
                piece = null;
            }
        }
        if (piece) {
            // Boyutları sabit tut
            piece.style.width = targetDiv === piecesArea ? piece.style.width : targetDiv.style.width;
            piece.style.height = targetDiv === piecesArea ? piece.style.height : targetDiv.style.height;
            piece.style.margin = '0';
            targetDiv.appendChild(piece);
            targetDiv.dataset.filled = '1';
            // Doğru mu kontrol et
            if (targetDiv.dataset.index == idx) {
                piece.style.border = '2px solid #4caf50';
            } else {
                piece.style.border = '2px solid #f44336';
            }
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
