/**
 * Narco Body Repair - Core Client Interactivity
 * Fully developed JavaScript for modern automotive body repair website
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  /* -------------------------------------------------------------
   * 1. Mobile Navigation Menu
   * ------------------------------------------------------------- */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
  const mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    if (mobileMenuDrawer && mobileMenuOverlay) {
      mobileMenuOverlay.classList.remove('hidden');
      setTimeout(() => {
        mobileMenuOverlay.classList.remove('opacity-0');
        mobileMenuDrawer.classList.remove('translate-x-full');
      }, 10);
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileMenu() {
    if (mobileMenuDrawer && mobileMenuOverlay) {
      mobileMenuDrawer.classList.add('translate-x-full');
      mobileMenuOverlay.classList.add('opacity-0');
      setTimeout(() => {
        mobileMenuOverlay.classList.add('hidden');
      }, 300);
      document.body.style.overflow = '';
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
  if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
  if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

  /* -------------------------------------------------------------
   * 2. Testimonial Carousel / Slider
   * ------------------------------------------------------------- */
  const testimonialContainer = document.getElementById('testimonialTrack');
  const prevTestimonialBtn = document.getElementById('prevTestimonial');
  const nextTestimonialBtn = document.getElementById('nextTestimonial');

  if (testimonialContainer && prevTestimonialBtn && nextTestimonialBtn) {
    const scrollAmount = () => {
      const card = testimonialContainer.querySelector('.testimonial-card');
      return card ? card.offsetWidth + 24 : 340;
    };

    nextTestimonialBtn.addEventListener('click', () => {
      testimonialContainer.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });

    prevTestimonialBtn.addEventListener('click', () => {
      testimonialContainer.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });
  }

  /* -------------------------------------------------------------
   * 3. Before & After Comparison Slider
   * ------------------------------------------------------------- */
  const sliderContainer = document.querySelector('.comparison-slider-container');
  if (sliderContainer) {
    const afterWrapper = sliderContainer.querySelector('.comparison-after-wrapper');
    const handle = sliderContainer.querySelector('.comparison-handle');
    let isDragging = false;

    function updateSlider(xPos) {
      const rect = sliderContainer.getBoundingClientRect();
      let percent = ((xPos - rect.left) / rect.width) * 100;
      if (percent < 0) percent = 0;
      if (percent > 100) percent = 100;

      afterWrapper.style.width = `${percent}%`;
      handle.style.left = `${percent}%`;
    }

    sliderContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support for mobile devices
    sliderContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches[0]) updateSlider(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || !e.touches[0]) return;
      updateSlider(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  /* -------------------------------------------------------------
   * 4. Interactive Repair Cost Estimator
   * ------------------------------------------------------------- */
  const vehicleTypeSelect = document.getElementById('estimatorVehicle');
  const repairTypeSelect = document.getElementById('estimatorService');
  const panelCheckboxes = document.querySelectorAll('.estimator-panel');
  const estimatedPriceEl = document.getElementById('estimatedPrice');
  const estimatedDurationEl = document.getElementById('estimatedDuration');

  function calculateEstimate() {
    if (!vehicleTypeSelect || !repairTypeSelect || !estimatedPriceEl) return;

    const vehicleMultiplier = parseFloat(vehicleTypeSelect.value) || 1.0;
    const baseServicePrice = parseInt(repairTypeSelect.value) || 350000;
    
    let selectedPanelCount = 0;
    panelCheckboxes.forEach(cb => {
      if (cb.checked) selectedPanelCount++;
    });

    if (selectedPanelCount === 0) selectedPanelCount = 1;

    // Calculation logic
    const totalMin = Math.round((baseServicePrice * selectedPanelCount * vehicleMultiplier) * 0.9);
    const totalMax = Math.round((baseServicePrice * selectedPanelCount * vehicleMultiplier) * 1.25);

    // Format Rupiah
    const formatIDR = (num) => 'Rp ' + num.toLocaleString('id-ID');
    estimatedPriceEl.innerText = `${formatIDR(totalMin)} - ${formatIDR(totalMax)}`;

    // Time estimate
    let days = Math.ceil(selectedPanelCount * 0.8);
    if (baseServicePrice > 1500000) days += 3; // Full body or deep repair
    if (days < 1) days = 1;
    if (estimatedDurationEl) {
      estimatedDurationEl.innerText = `${days} - ${days + 2} Hari Kerja (Garansi 6 Bulan)`;
    }
  }

  if (vehicleTypeSelect) vehicleTypeSelect.addEventListener('change', calculateEstimate);
  if (repairTypeSelect) repairTypeSelect.addEventListener('change', calculateEstimate);
  panelCheckboxes.forEach(cb => cb.addEventListener('change', calculateEstimate));
  calculateEstimate();

  /* -------------------------------------------------------------
   * 5. Interactive Map Setup (Leaflet)
   * ------------------------------------------------------------- */
  const mapElement = document.getElementById('narcoMap');
  if (mapElement && typeof L !== 'undefined') {
    // Workshop Coordinates: Jakarta Pusat / Barat Automotive Hub (-6.1754, 106.8272)
    const lat = -6.1754;
    const lng = 106.8272;
    const map = L.map('narcoMap', {
      center: [lat, lng],
      zoom: 14,
      scrollWheelZoom: false
    });

    // Dark sleek tile layer
    const darkTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors & CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Custom Map Marker with Blue Glow
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="background-color: #2563eb; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(37, 99, 235, 0.7); border: 3px solid #ffffff;">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -24]
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: inherit; padding: 6px 2px;">
        <h4 style="font-weight: 800; color: #0f172a; margin-bottom: 4px; font-size: 15px;">Narco Body Repair</h4>
        <p style="font-size: 13px; color: #475569; margin: 0 0 8px;">Spesialis Body Repair, Ketok Magic & Cat Oven</p>
        <a href="https://maps.google.com" target="_blank" style="display: inline-block; background: #2563eb; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none;">Buka di Google Maps &rarr;</a>
      </div>
    `).openPopup();
  }

  /* -------------------------------------------------------------
   * 6. Appointment Booking Modal
   * ------------------------------------------------------------- */
  const bookingModal = document.getElementById('bookingModal');
  const bookingForm = document.getElementById('bookingForm');
  const openBookingBtns = document.querySelectorAll('.open-booking-btn');
  const closeBookingBtn = document.getElementById('closeBookingBtn');
  const bookingModalBackdrop = document.getElementById('bookingModalBackdrop');

  function openBookingModal(defaultService = '') {
    if (bookingModal) {
      bookingModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      if (defaultService && document.getElementById('modalServiceInput')) {
        document.getElementById('modalServiceInput').value = defaultService;
      }
    }
  }

  function closeBookingModal() {
    if (bookingModal) {
      bookingModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  openBookingBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceName = btn.getAttribute('data-service') || '';
      openBookingModal(serviceName);
    });
  });

  if (closeBookingBtn) closeBookingBtn.addEventListener('click', closeBookingModal);
  if (bookingModalBackdrop) bookingModalBackdrop.addEventListener('click', closeBookingModal);

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('bookName').value;
      const phone = document.getElementById('bookPhone').value;
      const vehicle = document.getElementById('bookVehicle').value;
      const service = document.getElementById('modalServiceInput').value;
      const date = document.getElementById('bookDate').value;
      const notes = document.getElementById('bookNotes').value;

      // Construct WhatsApp Direct Message
      const waMessage = `Halo Narco Body Repair, saya ingin booking jadwal perbaikan:\n\n*Nama:* ${name}\n*No. HP/WA:* ${phone}\n*Kendaraan:* ${vehicle}\n*Layanan:* ${service}\n*Rencana Tanggal:* ${date}\n*Catatan Kerusakan:* ${notes || '-'}\n\nMohon konfirmasi ketersediaan jadwal. Terima kasih!`;
      const waUrl = `https://wa.me/6285803100168?text=${encodeURIComponent(waMessage)}`;

      showToast('Permintaan booking Anda sedang diproses! Mengalihkan ke WhatsApp...');
      setTimeout(() => {
        window.open(waUrl, '_blank');
        closeBookingModal();
        bookingForm.reset();
      }, 1000);
    });
  }

  /* -------------------------------------------------------------
   * 7. Service Detail Modal (Explore Service)
   * ------------------------------------------------------------- */
  const serviceDetailModal = document.getElementById('serviceDetailModal');
  const closeServiceModalBtn = document.getElementById('closeServiceModalBtn');
  const serviceModalBackdrop = document.getElementById('serviceModalBackdrop');
  const exploreServiceBtns = document.querySelectorAll('.explore-service-btn');

  const serviceData = {
    'body-dent': {
      title: 'Body Dent & Collision Repair',
      badge: 'Chassis & Panel Restoration',
      image: 'assets/images/service_body_dent.jpg',
      desc: 'Restorasi kerusakan bodi akibat benturan, tabrakan, penyok, hingga kerusakan sasis berat. Kami menggunakan teknologi hydraulic frame aligner berakurasi milimeter untuk mengembalikan dimensi presisi rangka kendaraan Anda sesuai standar pabrikan (OEM).',
      features: [
        'Paintless Dent Removal (PDR) untuk penyok ringan tanpa merusak cat orisinil',
        'Hydraulic Chassis Jig untuk perbaikan rangka mobil bengkok/miring',
        'Panel Beating presisi dengan alat las bodi modern (Spot Welder)',
        'Garansi kepresisian pintu, kap mesin, dan bumper menutup sempurna'
      ]
    },
    'cat-oven': {
      title: 'Precision Cat Oven & Paint Match',
      badge: 'OEM Factory Standard Paint',
      image: 'assets/images/service_cat_oven.jpg',
      desc: 'Pengecatan bodi mobil berstandar pabrikan menggunakan ruang semprot Cat Oven bebas debu dengan kontrol temperatur optimal. Didukung sistem pencampuran cat terkomputerisasi (Spectrophotometer) yang menjamin kesamaan warna 99.9% tanpa belang.',
      features: [
        'Ruang Spray Booth & Oven System bersirkulasi udara ganda',
        'Sistem mixing cat komputerisasi Dupont / Sikkens / Spies Hecker',
        'Bahan clear coat berkualitas tinggi anti-UV dan tahan gores',
        'Garansi cat 1 tahun tidak mengelupas atau pudar'
      ]
    },
    'detailing': {
      title: 'Premium Detailing & Nano Ceramic Coating',
      badge: 'Showroom Gloss & Paint Protection',
      image: 'assets/images/service_detailing.jpg',
      desc: 'Perawatan kosmetik menyeluruh untuk mengembalikan kilau cat kendaraan Anda. Termasuk multi-stage paint correction untuk menghilangkan baret halus (swirl mark), jamur air, dan oksidasi cat, diakhiri dengan proteksi Nano Ceramic Coating 9H.',
      features: [
        '3-Stage Compound & Polishing untuk hasil bodi super glossy (wet look)',
        'Lapisan Nano Ceramic Coating 9H dengan efek daun talas (hydrophobic)',
        'Deep cleaning interior, ruang mesin, dan velg roda',
        'Proteksi jangka panjang dari sinar UV matahari, getah pohon, dan kotoran burung'
      ]
    }
  };

  function openServiceModal(serviceKey) {
    const data = serviceData[serviceKey];
    if (!data || !serviceDetailModal) return;

    document.getElementById('serviceModalTitle').innerText = data.title;
    document.getElementById('serviceModalBadge').innerText = data.badge;
    document.getElementById('serviceModalImg').src = data.image;
    document.getElementById('serviceModalDesc').innerText = data.desc;

    const listContainer = document.getElementById('serviceModalFeatures');
    listContainer.innerHTML = '';
    data.features.forEach(f => {
      const li = document.createElement('li');
      li.className = 'flex items-start gap-2 text-sm text-slate-300';
      li.innerHTML = `<span class="text-blue-500 font-bold">✓</span> <span>${f}</span>`;
      listContainer.appendChild(li);
    });

    serviceDetailModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeServiceModal() {
    if (serviceDetailModal) {
      serviceDetailModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  exploreServiceBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceKey = btn.getAttribute('data-service-key');
      openServiceModal(serviceKey);
    });
  });

  if (closeServiceModalBtn) closeServiceModalBtn.addEventListener('click', closeServiceModal);
  if (serviceModalBackdrop) serviceModalBackdrop.addEventListener('click', closeServiceModal);

  /* -------------------------------------------------------------
   * 8. Gallery Filter & Lightbox
   * ------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeLightboxBtn = document.getElementById('closeLightboxBtn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('bg-[#161922]', 'text-slate-400');
      });
      btn.classList.add('bg-blue-600', 'text-white');
      btn.classList.remove('bg-[#161922]', 'text-slate-400');

      const filter = btn.getAttribute('data-filter');
      galleryItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.getAttribute('data-title') || 'Narco Body Repair Workshop';
      if (img && lightboxModal && lightboxImg) {
        lightboxImg.src = img.src;
        if (lightboxCaption) lightboxCaption.innerText = caption;
        lightboxModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closeLightboxBtn) {
    closeLightboxBtn.addEventListener('click', () => {
      lightboxModal.classList.add('hidden');
      document.body.style.overflow = '';
    });
  }
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal || e.target.id === 'lightboxBackdrop') {
        lightboxModal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  }

  /* -------------------------------------------------------------
   * 9. Newsletter & Toast Notification
   * ------------------------------------------------------------- */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        showToast('Terima kasih! Anda telah terdaftar untuk promo & update Narco Body Repair.');
        newsletterForm.reset();
      }
    });
  }

  function showToast(message) {
    let toast = document.getElementById('globalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalToast';
      toast.className = 'fixed bottom-6 right-6 z-50 bg-[#161922] border border-blue-500/50 text-[#e1e8f0] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-10 opacity-0';
      toast.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">✓</div>
        <span id="toastMessage" class="text-sm font-medium"></span>
      `;
      document.body.appendChild(toast);
    }
    document.getElementById('toastMessage').innerText = message;
    toast.classList.remove('translate-y-10', 'opacity-0');
    setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
    }, 4000);
  }

  /* -------------------------------------------------------------
   * 10. Sticky Navbar Background Adjustment on Scroll
   * ------------------------------------------------------------- */
  const mainNavbar = document.getElementById('mainNavbar');
  if (mainNavbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        mainNavbar.classList.add('shadow-md', 'backdrop-blur-md', 'bg-opacity-95');
      } else {
        mainNavbar.classList.remove('shadow-md', 'backdrop-blur-md', 'bg-opacity-95');
      }
    });
  }
});
