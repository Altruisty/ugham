// ── Page Transitions ──
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('page-transition');
  if (overlay) { requestAnimationFrame(() => { overlay.classList.add('loaded'); setTimeout(() => overlay.style.display = 'none', 500); }); }
});
document.querySelectorAll('a').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = anchor.getAttribute('href');
    if (target && target.endsWith('.html') && !anchor.hasAttribute('target')) {
      e.preventDefault();
      const overlay = document.getElementById('page-transition');
      if (overlay) { overlay.style.display = 'block'; overlay.classList.remove('loaded'); overlay.classList.add('animating'); setTimeout(() => window.location.href = target, 400); }
      else { window.location.href = target; }
    }
  });
});

// ── Navbar scroll ──
const nav = document.querySelector('#navbar');
if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));

// ── Mobile menu ──
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => { navLinks.classList.toggle('open'); menuToggle.textContent = navLinks.classList.contains('open') ? '\u2715' : '\u2630'; });
}

// ── Scroll Animations (unique per section) ──
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.anim-el').forEach(el => animObserver.observe(el));

// ── Ugham Brand Orbit (Logo in Center) ──
const orbitCanvas = document.getElementById('orbitCanvas');
if (orbitCanvas) {
  const ctx = orbitCanvas.getContext('2d');
  const size = orbitCanvas.width;
  const cx = size / 2, cy = size / 2;
  let t = 0;
  const centerLogo = new Image();
  centerLogo.src = 'assets/img/logo.png';

  // SVG icon paths (professional)
  const icons = [
    { path: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', r: size * 0.24, speed: 0.008, angle: 0, color: '#7C3AED' },       // layers
    { path: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z', r: size * 0.37, speed: 0.005, angle: 2.1, color: '#C026D3' }, // star
    { path: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M18.364 18.364l-.707-.707M12 21v-1m-4.95-.636l-.707.707M4 12H3m3.343-5.657l-.707-.707', r: size * 0.24, speed: 0.008, angle: 4.2, color: '#4338CA' }, // sun
    { path: 'M13 10V3L4 14h7v7l9-11h-7z', r: size * 0.37, speed: 0.005, angle: 0.7, color: '#7C3AED' },    // bolt
    { path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z', r: size * 0.46, speed: 0.003, angle: 3.5, color: '#C026D3' }, // globe
  ];

  function drawOrbit() {
    ctx.clearRect(0, 0, size, size);
    t += 0.5;

    // Orbit rings
    const r1 = size * 0.24, r2 = size * 0.37, r3 = size * 0.46;
    [r1, r2, r3].forEach(r => {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(124,58,237,0.12)'; ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]);
    });

    // Center glow
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, size * 0.18);
    grad.addColorStop(0, 'rgba(67,56,202,0.15)');
    grad.addColorStop(1, 'rgba(192,38,211,0.05)');
    ctx.beginPath(); ctx.arc(cx, cy, size * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = grad; ctx.fill();

    // Spinning arc
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.01);
    const arcGrad = ctx.createLinearGradient(-size * 0.18, 0, size * 0.18, 0);
    arcGrad.addColorStop(0, '#4338CA'); arcGrad.addColorStop(0.5, '#7C3AED'); arcGrad.addColorStop(1, '#C026D3');
    ctx.beginPath(); ctx.arc(0, 0, size * 0.18, -0.5, Math.PI + 0.5);
    ctx.strokeStyle = arcGrad; ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();

    // Center logo
    if (centerLogo.complete && centerLogo.naturalWidth > 0) {
      const lw = size * 0.28, lh = size * 0.16;
      ctx.drawImage(centerLogo, cx - lw / 2, cy - lh / 2, lw, lh);
    }

    // Orbiting nodes (circles with FontAwesome icons)
    icons.forEach(node => {
      node.angle += node.speed;
      const nx = cx + Math.cos(node.angle) * node.r;
      const ny = cy + Math.sin(node.angle) * node.r;

      // White circle bg
      ctx.beginPath(); ctx.arc(nx, ny, size * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.shadowColor = node.color; ctx.shadowBlur = 15;
      ctx.fill(); ctx.shadowBlur = 0;

      // Colored dot in center of node
      ctx.beginPath(); ctx.arc(nx, ny, size * 0.02, 0, Math.PI * 2);
      ctx.fillStyle = node.color; ctx.fill();
    });

    requestAnimationFrame(drawOrbit);
  }
  // Wait for fonts then start
  if (document.fonts) document.fonts.ready.then(drawOrbit);
  else drawOrbit();
}

// ── DNA Helix (About page) ──
const dnaCanvas = document.getElementById('dnaCanvas');
if (dnaCanvas) {
  const ctx = dnaCanvas.getContext('2d'); let w, h, time = 0;
  function resizeDNA() { w = dnaCanvas.width = window.innerWidth; h = dnaCanvas.height = window.innerHeight; }
  window.addEventListener('resize', resizeDNA); resizeDNA();
  function drawDNA() {
    ctx.clearRect(0, 0, w, h); time += 0.018;
    const cols = Math.max(1, Math.floor(w / 200));
    for (let c = 0; c < cols; c++) {
      const cx2 = (c + 0.5) * (w / cols);
      const num = 20, spacing = h / (num + 2);
      for (let i = 0; i < num; i++) {
        const y = spacing * (i + 1), shift = (i / num) * Math.PI * 3 + c * 1.5;
        const x1 = cx2 + Math.sin(time + shift) * 50;
        const x2 = cx2 + Math.sin(time + shift + Math.PI) * 50;
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y);
        ctx.strokeStyle = 'rgba(124,58,237,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(x1, y, 4, 0, Math.PI * 2); ctx.fillStyle = 'rgba(67,56,202,0.4)'; ctx.fill();
        ctx.beginPath(); ctx.arc(x2, y, 4, 0, Math.PI * 2); ctx.fillStyle = 'rgba(192,38,211,0.4)'; ctx.fill();
      }
    }
    requestAnimationFrame(drawDNA);
  }
  drawDNA();
}

// ── Starry Light (What We Do) ──
const stCanvas = document.getElementById('starryLightCanvas');
if (stCanvas) {
  const ctx = stCanvas.getContext('2d'); let w, h, stars = [];
  function resizeSt() { w = stCanvas.width = stCanvas.offsetWidth; h = stCanvas.height = stCanvas.offsetHeight; }
  window.addEventListener('resize', resizeSt); resizeSt();
  for (let i = 0; i < 120; i++) stars.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2.5, speed: Math.random() * 0.4 + 0.1, opacity: Math.random() });
  function drawSt() {
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      s.y -= s.speed; s.opacity += 0.01;
      if (s.y < 0) { s.y = h; s.x = Math.random() * w; s.opacity = 0; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124,58,237,${0.2 + Math.abs(Math.sin(s.opacity)) * 0.5})`; ctx.fill();
    });
    requestAnimationFrame(drawSt);
  }
  drawSt();
}

// ── Ripple (Collab) ──
const rippleCanvas = document.getElementById('rippleCanvas');
if (rippleCanvas) {
  const ctx = rippleCanvas.getContext('2d'); let w, h, t = 0;
  function resizeRip() { w = rippleCanvas.width = rippleCanvas.offsetWidth; h = rippleCanvas.height = rippleCanvas.offsetHeight; }
  window.addEventListener('resize', resizeRip); resizeRip();
  function drawRip() {
    ctx.clearRect(0, 0, w, h); t += 0.04;
    const cx = w / 2, cy = h / 2;
    for (let i = 0; i < 6; i++) {
      let radius = ((t * 15 + i * 60) % 350);
      let alpha = 1 - (radius / 350);
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(124,58,237,${alpha * 0.4})`; ctx.lineWidth = 2; ctx.stroke();
    }
    requestAnimationFrame(drawRip);
  }
  drawRip();
}

// Mobile scroll-activated animations (reliable width check)
if(window.innerWidth <= 768){
  const mio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) { e.target.classList.add('scroll-visible'); }
      else { e.target.classList.remove('scroll-visible'); }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
  
  const selectors = '.ia-card,.hex-card,.expertise-card,.info-card,.kanban-card,.flow-step,.bento-card,.price-card,.expertise-v2,.vm-panel,.reason-item,.ds-card,.trophy-card,.partner-pill,.ex-strip,.tower-item';
  document.querySelectorAll(selectors).forEach(el => mio.observe(el));
}


// ── Advanced Autocomplete for College & City ──
document.addEventListener('DOMContentLoaded', () => {
  const collegeInput = document.getElementById('collegeInput');
  const collegeList = document.getElementById('collegeList');
  
  if (collegeInput && collegeList) {
    const indianColleges = [
      "St Josephs College of Engineering", "St Josephs Institute of Technology", "IIT Madras", "IIT Bombay", "IIT Delhi", "IIT Kanpur", "IIT Kharagpur", "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad",
      "NIT Trichy", "NIT Surathkal", "NIT Warangal", "NIT Calicut", "NIT Rourkela", "Anna University", "SRM Institute of Science and Technology", "VIT Vellore", "VIT Chennai", "BITS Pilani", "BITS Goa", "BITS Hyderabad",
      "PSG College of Technology", "SSN College of Engineering", "Madras Institute of Technology", "CEG Guindy", "Sathyabama Institute of Science and Technology", "Hindustan Institute of Technology and Science",
      "Rajalakshmi Engineering College", "Sri Venkateswara College of Engineering", "RMK Engineering College", "RMD Engineering College", "Easwari Engineering College", "Meenakshi Sundararajan Engineering College",
      "Kumaraguru College of Technology", "Sri Krishna College of Engineering and Technology", "Bannari Amman Institute of Technology", "Kongu Engineering College", "Thiagarajar College of Engineering",
      "SASTRA University", "Amrita Vishwa Vidyapeetham", "Karunya Institute of Technology and Sciences", "Manipal Institute of Technology", "RV College of Engineering", "BMS College of Engineering",
      "Ramaiah Institute of Technology", "PES University", "Delhi Technological University", "NSUT Delhi", "IIIT Hyderabad", "IIIT Bangalore", "IIIT Delhi", "IIIT Allahabad", "IIIT Kancheepuram",
      "Jadavpur University", "VJTI Mumbai", "College of Engineering Pune", "Thapar Institute of Engineering and Technology", "Kalinga Institute of Industrial Technology", "Siksha O Anusandhan",
      "Loyola College", "Madras Christian College", "Stella Maris College", "Ethiraj College for Women", "Women's Christian College", "Presidency College", "Pachaiyappa's College", "DG Vaishnav College"
    ];
    
    collegeInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      collegeList.innerHTML = '';
      if (!query) return;
      
      const filtered = indianColleges.filter(col => col.toLowerCase().includes(query)).slice(0, 15);
      filtered.forEach(col => {
        const opt = document.createElement('option');
        opt.value = col;
        collegeList.appendChild(opt);
      });
    });
  }

  const cityInput = document.querySelector('input[name="city"]');
  const cityList = document.getElementById('cityList');
  if (cityInput && cityList) {
    const indianCities = [
      "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad", "Bareilly", "Moradabad", "Mysore", "Gurgaon", "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar", "Salem", "Mira-Bhayandar", "Thiruvananthapuram", "Bhiwandi", "Saharanpur", "Guntur", "Amravati", "Bikaner", "Noida", "Jamshedpur", "Bhilai", "Cuttack", "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Rourkela", "Nanded", "Kolhapur", "Ajmer", "Akola", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar", "Jammu", "Mangalore", "Erode", "Belgaum", "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Jalgaon", "Udaipur", "Maheshtala", "Davanagere", "Kozhikode", "Akbarpur"
    ];
    
    cityInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      cityList.innerHTML = '';
      if (!query) return;
      
      const filtered = indianCities.filter(city => city.toLowerCase().includes(query)).slice(0, 15);
      filtered.forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        cityList.appendChild(opt);
      });
    });
  }
});

// Registration Form & Floating Button Logic
document.addEventListener('DOMContentLoaded', () => {
  const floatBtn = document.getElementById('floatingRegisterBtn');
  const regForm = document.getElementById('registration-form');
  
  if (floatBtn && regForm) {
    window.addEventListener('scroll', () => {
      const rect = regForm.getBoundingClientRect();
      // Hide button if form is fully in view or user scrolled past it
      if (rect.top < window.innerHeight - 100) {
        floatBtn.classList.remove('show');
      } else {
        floatBtn.classList.add('show');
      }
    });
    // trigger once
    window.dispatchEvent(new Event('scroll'));
  }

  const form = document.getElementById('ughamContactForm');
  if(form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...';
      btn.disabled = true;

      // EXCEL SHEET INTEGRATION (Google Apps Script)
      // Note: Replace this SCRIPT_URL with your actual Google Apps Script web app URL
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTIk7_bfbH3OETWd-KEQgWlYxd3DrS7-nmFSG4zCDuSdAXxDrZijmA8HrulgjW8Z0cFA/exec'; 
      
      const formData = new FormData(form);
      
      fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // Required for Google Scripts without CORS setup
      }).then(() => {
        form.style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';
      }).catch(err => {
        console.error(err);
        // Fallback UI just in case of actual network failure
        form.style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block'; 
      });
    });
  }
});

// ── Ugham Award Form Logic ──
document.addEventListener('DOMContentLoaded', () => {
  const awardForm = document.getElementById('ughamAwardForm');
  if (awardForm) {
    const teamSizeSelect = document.getElementById('teamSizeSelect');
    const membersContainer = document.getElementById('dynamicMembersContainer');
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    const totalAmountDisplay = document.getElementById('totalAmountDisplay');
    const totalAmountInput = document.getElementById('totalAmountInput');

    function calculateTotal() {
      let teamSize = parseInt(teamSizeSelect.value) || 0;
      let price = 0;
      categoryRadios.forEach(r => { if (r.checked) price = parseInt(r.getAttribute('data-price')); });
      
      if (teamSize > 0 && price > 0) {
        const total = teamSize * price;
        totalAmountDisplay.textContent = `₹${total}`;
        totalAmountInput.value = total;
      } else {
        totalAmountDisplay.textContent = `₹0`;
        totalAmountInput.value = 0;
      }
    }

    teamSizeSelect.addEventListener('change', (e) => {
      calculateTotal();
      const count = parseInt(e.target.value);
      membersContainer.innerHTML = '';
      
      // We already have the leader details in the form. So we just need member 2 to count.
      for (let i = 2; i <= count; i++) {
        const memHtml = `
          <div class="member-block" style="background:rgba(255,255,255,0.02); padding:20px; border-radius:12px; margin-bottom:16px; border:1px solid var(--border);">
            <h4 style="margin-bottom:16px; color:var(--primary);">Member ${i} Details</h4>
            <div class="grid-3" style="gap:16px;">
              <div class="form-group" style="margin-bottom:0;"><input type="text" name="member_${i}_name" required placeholder="Name"></div>
              <div class="form-group" style="margin-bottom:0;"><input type="tel" name="member_${i}_phone" required placeholder="Phone"></div>
              <div class="form-group" style="margin-bottom:0;"><input type="email" name="member_${i}_email" required placeholder="Email"></div>
            </div>
          </div>
        `;
        membersContainer.insertAdjacentHTML('beforeend', memHtml);
      }
    });

    categoryRadios.forEach(r => r.addEventListener('change', calculateTotal));

    // Form Submission
    awardForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = awardForm.querySelector('button[type="submit"]');
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
      btn.disabled = true;

      // SCRIPT_URL from contact.html logic
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTIk7_bfbH3OETWd-KEQgWlYxd3DrS7-nmFSG4zCDuSdAXxDrZijmA8HrulgjW8Z0cFA/exec';
      const formData = new FormData(awardForm);

      fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      }).then(() => {
        awardForm.style.display = 'none';
        document.getElementById('awardFormSuccess').style.display = 'block';
        // Hide success message and act like payment gateway opened after 3s
        setTimeout(() => {
          document.getElementById('awardFormSuccess').innerHTML = `
            <i class="fa-solid fa-lock" style="font-size:48px; color:var(--primary); margin-bottom:20px;"></i>
            <h3>Secure Payment Gateway</h3>
            <p style="color:var(--muted); margin-top:12px;">Waiting for external payment provider...</p>
          `;
        }, 2000);
      }).catch(err => {
        console.error(err);
        awardForm.style.display = 'none';
        document.getElementById('awardFormSuccess').style.display = 'block';
      });
    });
  }
});


// ── Advanced Autocomplete for College & City ──
document.addEventListener('DOMContentLoaded', () => {
  const collegeInput = document.getElementById('collegeInput');
  const collegeList = document.getElementById('collegeList');
  
  if (collegeInput && collegeList) {
    let debounceTimer;
    collegeInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim();
      if (query.length < 3) return; // wait for 3 chars
      
      debounceTimer = setTimeout(() => {
        fetch(`http://universities.hipolabs.com/search?country=India&name=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => {
            collegeList.innerHTML = '';
            // Get unique names, max 10
            const unique = [...new Set(data.map(item => item.name))].slice(0, 10);
            unique.forEach(name => {
              const opt = document.createElement('option');
              opt.value = name;
              collegeList.appendChild(opt);
            });
          })
          .catch(err => console.error('College API Error:', err));
      }, 500); // 500ms debounce
    });
  }

  const cityInput = document.querySelector('input[name="city"]');
  const cityList = document.getElementById('cityList');
  if (cityInput && cityList) {
    // Top ~100 Indian Cities
    const indianCities = [
      "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad", "Bareilly", "Moradabad", "Mysore", "Gurgaon", "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar", "Salem", "Mira-Bhayandar", "Thiruvananthapuram", "Bhiwandi", "Saharanpur", "Guntur", "Amravati", "Bikaner", "Noida", "Jamshedpur", "Bhilai", "Cuttack", "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Rourkela", "Nanded", "Kolhapur", "Ajmer", "Akola", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar", "Jammu", "Sangli-Miraj & Kupwad", "Mangalore", "Erode", "Belgaum", "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Jalgaon", "Udaipur", "Maheshtala", "Davanagere", "Kozhikode", "Akbarpur"
    ];
    
    cityInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      cityList.innerHTML = '';
      if (!query) return;
      
      const filtered = indianCities.filter(city => city.toLowerCase().includes(query)).slice(0, 10);
      filtered.forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        cityList.appendChild(opt);
      });
    });
  }
});
