/**
 * VORTEX HUB - Image Tools (Client-side)
 */

const ImageTools = {
  currentImage: null,
  canvas: null,
  ctx: null,

  init() {
    this.showFromHash();
    window.addEventListener('hashchange', () => this.showFromHash());
    this.canvas = document.getElementById('img-canvas');
    if (this.canvas) this.ctx = this.canvas.getContext('2d');
    this.bindUpload();
    this.bindActions();
  },

  showFromHash() {
    const hash = window.location.hash.slice(1) || 'resize';
    document.querySelectorAll('.tool-sidebar a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + hash);
    });
  },

  bindUpload() {
    const input = document.getElementById('img-upload');
    if (!input) return;
    
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file || !file.type.startsWith('image/')) {
        Toast.show('Pilih file gambar', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          this.currentImage = img;
          this.drawImage(img);
          document.getElementById('img-info').textContent = 
            `${img.width} × ${img.height} px | ${(file.size / 1024).toFixed(1)} KB | ${file.type}`;
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  drawImage(img, w, h) {
    if (!this.canvas) return;
    const width = w || img.width;
    const height = h || img.height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(img, 0, 0, width, height);
    document.getElementById('img-preview-box').classList.add('has-image');
  },

  bindActions() {
    document.getElementById('btn-img-resize')?.addEventListener('click', () => {
      if (!this.currentImage) return Toast.show('Upload gambar dulu', 'warning');
      const w = parseInt(document.getElementById('img-width').value);
      const h = parseInt(document.getElementById('img-height').value);
      if (!w || !h) return Toast.show('Masukkan lebar & tinggi', 'warning');
      this.drawImage(this.currentImage, w, h);
      Toast.show('Gambar di-resize', 'success');
    });

    document.getElementById('btn-img-rotate')?.addEventListener('click', () => {
      if (!this.currentImage) return Toast.show('Upload gambar dulu', 'warning');
      const angle = parseInt(document.getElementById('img-angle').value) || 90;
      const rad = angle * Math.PI / 180;
      const w = this.currentImage.width;
      const h = this.currentImage.height;
      
      // Create temp canvas for rotation
      const temp = document.createElement('canvas');
      const tctx = temp.getContext('2d');
      if (angle % 180 === 0) {
        temp.width = w; temp.height = h;
      } else {
        temp.width = h; temp.height = w;
      }
      tctx.translate(temp.width / 2, temp.height / 2);
      tctx.rotate(rad);
      tctx.drawImage(this.currentImage, -w / 2, -h / 2);
      
      const rotated = new Image();
      rotated.onload = () => {
        this.currentImage = rotated;
        this.drawImage(rotated);
        Toast.show(`Diputar ${angle}°`, 'success');
      };
      rotated.src = temp.toDataURL();
    });

    document.getElementById('btn-img-download')?.addEventListener('click', () => {
      if (!this.canvas || !this.currentImage) return Toast.show('Tidak ada gambar', 'warning');
      const quality = parseFloat(document.getElementById('img-quality')?.value) || 0.8;
      const link = document.createElement('a');
      link.download = 'vortex-image.jpg';
      link.href = this.canvas.toDataURL('image/jpeg', quality);
      link.click();
      Toast.show('Gambar diunduh', 'success');
    });

    document.getElementById('btn-img-compress')?.addEventListener('click', () => {
      if (!this.canvas || !this.currentImage) return Toast.show('Upload gambar dulu', 'warning');
      const quality = parseFloat(document.getElementById('img-quality').value) || 0.6;
      const dataUrl = this.canvas.toDataURL('image/jpeg', quality);
      const sizeKB = Math.round((dataUrl.length * 0.75) / 1024);
      document.getElementById('img-compress-info').textContent = `Estimasi ukuran: ~${sizeKB} KB (quality ${quality})`;
      Toast.show('Siap diunduh dengan kompresi', 'success');
    });
  }
};

window.ImageTools = ImageTools;
