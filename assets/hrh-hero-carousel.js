/*
  HRH: TOP の HERO カルーセル（sections/hrh-hero-carousel.liquid）

  トラックには [複製][本体][複製] の順にスライドが並ぶ。
  表示位置は本体の範囲に保ち、送った結果が範囲外に出たら
  アニメーション終了後に1周ぶん瞬間移動させて継ぎ目を隠す。
*/
class HrhHeroCarousel extends HTMLElement {
  connectedCallback() {
    this.track = this.querySelector('.hrh-hero__track');
    this.slides = Array.from(this.track.querySelectorAll('.hrh-hero__slide'));
    this.count = this.slides.length / 3;
    if (this.count < 2) return;

    this.index = this.count;
    this.interval = (Number(this.dataset.interval) || 5) * 1000;
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.track.addEventListener('transitionend', (e) => {
      if (e.target !== this.track) return;
      if (this.index >= this.count * 2) this.moveTo(this.index - this.count, false);
      if (this.index < this.count) this.moveTo(this.index + this.count, false);
    });

    window.addEventListener('resize', () => this.moveTo(this.index, false));
    this.moveTo(this.index, false);

    this.addEventListener('mouseenter', () => this.stop());
    this.addEventListener('mouseleave', () => this.start());
    document.addEventListener('visibilitychange', () => (document.hidden ? this.stop() : this.start()));

    this.addEventListener('touchstart', (e) => {
      this.touchX = e.touches[0].clientX;
      this.stop();
    }, { passive: true });
    this.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - this.touchX;
      if (Math.abs(dx) > 40) this.moveTo(this.index + (dx < 0 ? 1 : -1), true);
      this.start();
    });

    this.start();
  }

  disconnectedCallback() {
    this.stop();
  }

  moveTo(index, animate) {
    this.index = index;
    const slide = this.slides[index];
    const x = (this.clientWidth - slide.offsetWidth) / 2 - slide.offsetLeft;
    this.track.style.transition = animate && !this.reduceMotion ? '' : 'none';
    this.track.style.transform = `translateX(${x}px)`;
    this.slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    if (!animate || this.reduceMotion) {
      // transition: none を確定させてから次の送りで再びアニメーションさせる
      this.track.getBoundingClientRect();
      if (this.reduceMotion) this.track.dispatchEvent(new Event('transitionend'));
    }
  }

  start() {
    if (this.reduceMotion || this.timer) return;
    this.timer = setInterval(() => this.moveTo(this.index + 1, true), this.interval);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }
}

if (!customElements.get('hrh-hero-carousel')) customElements.define('hrh-hero-carousel', HrhHeroCarousel);
