(function(){
  "use strict";

  var sectionMap = {
    "topbar-placeholder": "sections/topbar.html",
    "header-placeholder": "sections/header.html",
    "hero-placeholder": "sections/hero.html",
    "collections-placeholder": "sections/collections.html",
    "shop-placeholder": "sections/shop.html",
    "ingredients-placeholder": "sections/ingredients.html",
    "concerns-placeholder": "sections/concerns.html",
    "results-placeholder": "sections/results.html",
    "testimonials-placeholder": "sections/testimonials.html",
    "press-placeholder": "sections/press.html",
    "derm-placeholder": "sections/derm.html",
    "sustainability-placeholder": "sections/sustainability.html",
    "gallery-placeholder": "sections/gallery.html",
    "newsletter-placeholder": "sections/newsletter.html",
    "footer-placeholder": "sections/footer.html"
  };

  function loadSection(id, filePath){
    return fetch(filePath)
      .then(function(response){
        if(!response.ok){ throw new Error("Failed to load " + filePath); }
        return response.text();
      })
      .then(function(html){
        document.getElementById(id).innerHTML = html;
      });
  }

  function loadSections(){
    return Promise.all(Object.keys(sectionMap).map(function(id){ return loadSection(id, sectionMap[id]); }));
  }

  function initSite(){
    // ----- Product data (demo) -----
    var products = [
      {name:"Renewal Serum", tag:"Best seller", price:"$58", old:null, rating:"★★★★★ 4.9 (312)", stock:"Only 6 left", color:"var(--sage)"},
      {name:"Barrier Repair Cream", tag:"New", price:"$46", old:"$54", rating:"★★★★★ 4.8 (198)", stock:null, color:"var(--beige)"},
      {name:"Calm Cleansing Balm", tag:"Sensitive skin", price:"$32", old:null, rating:"★★★★☆ 4.6 (140)", stock:null, color:"var(--pink)"},
      {name:"Daily Mineral SPF 40", tag:"Best seller", price:"$38", old:null, rating:"★★★★★ 4.9 (401)", stock:"Only 4 left", color:"#EFEFEF"}
    ];

    var grid = document.getElementById("productGrid");
    products.forEach(function(p){
      var card = document.createElement("div");
      card.className = "prod-card reveal";
      card.innerHTML =
        '<div class="prod-media" style="background:'+p.color+'22;">'+
          (p.stock ? '<span class="stock-flag">'+p.stock+'</span>' : '') +
          '<div class="quick-actions">'+
            '<button class="qa-btn" aria-label="Quick view '+p.name+'"><svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg></button>'+
            '<button class="qa-btn wish-btn" aria-label="Add '+p.name+' to wishlist"><svg viewBox="0 0 24 24"><path d="M20.8 4.6c-1.9-1.9-5-1.9-6.9 0L12 5.5l-1.9-.9c-1.9-1.9-5-1.9-6.9 0-1.9 1.9-1.9 5 0 6.9L12 21l8.8-8.9c1.9-1.9 1.9-5 0-6.9z"/></svg></button>'+
          '</div>'+
          '<div class="swatch"><svg class="bottle" viewBox="0 0 80 140"><rect class="glass" x="18" y="24" width="44" height="100" rx="12"/><rect class="liquid" x="18" y="70" width="44" height="54" rx="8" fill="'+p.color+'"/><rect x="28" y="6" width="24" height="20" rx="5" fill="#2B2B2B" opacity="0.85"/></svg></div>'+
        '</div>'+
        '<div class="prod-info">'+
          '<span class="tag">'+p.tag+'</span>'+
          '<h4>'+p.name+'</h4>'+
          '<div class="rating">'+p.rating+'</div>'+
          '<div class="prod-price"><span>'+p.price+'</span>'+(p.old ? '<span class="old">'+p.old+'</span>' : '')+'</div>'+
          '<button class="add-cart-mini" data-name="'+p.name+'">Add to Cart</button>'+
        '</div>';
      grid.appendChild(card);
    });

    // ----- Cart toast -----
    var cartCount = document.getElementById("cartCount");
    var count = 3;
    var toast = document.getElementById("toast");
    var toastMsg = document.getElementById("toastMsg");
    var toastTimer;
    function showToast(msg){
      toastMsg.textContent = msg;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function(){ toast.classList.remove("show"); }, 2400);
    }
    document.addEventListener("click", function(e){
      var btn = e.target.closest(".add-cart-mini");
      if(btn){
        count++;
        cartCount.textContent = count;
        showToast("Added " + btn.dataset.name + " to cart");
      }
      var wish = e.target.closest(".wish-btn");
      if(wish){ showToast("Saved to wishlist"); }
    });

    // ----- Ripple -----
    document.querySelectorAll("[data-ripple]").forEach(function(el){
      el.addEventListener("click", function(){
        el.classList.remove("rippling");
        void el.offsetWidth;
        el.classList.add("rippling");
      });
    });

    // ----- Sticky header shadow -----
    var header = document.getElementById("siteHeader");
    window.addEventListener("scroll", function(){
      header.classList.toggle("scrolled", window.scrollY > 12);
    }, {passive:true});

    // ----- Mobile nav -----
    var burger = document.getElementById("burgerBtn");
    var mobileNav = document.getElementById("mobileNav");
    var scrim = document.getElementById("navScrim");
    var closeDrawer = document.getElementById("closeDrawer");
    function openNav(){
      mobileNav.classList.add("open"); scrim.classList.add("show");
      burger.setAttribute("aria-expanded","true");
      mobileNav.querySelector("a,button").focus();
    }
    function closeNav(){
      mobileNav.classList.remove("open"); scrim.classList.remove("show");
      burger.setAttribute("aria-expanded","false"); burger.focus();
    }
    burger.addEventListener("click", openNav);
    closeDrawer.addEventListener("click", closeNav);
    scrim.addEventListener("click", closeNav);
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && mobileNav.classList.contains("open")) closeNav();
    });
    mobileNav.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeNav); });

    // ----- Concern pills -----
    document.querySelectorAll(".concern-pill").forEach(function(pill){
      pill.addEventListener("click", function(){
        document.querySelectorAll(".concern-pill").forEach(function(p){ p.classList.remove("active"); });
        pill.classList.add("active");
      });
    });

    // ----- Before/after slider -----
    var frame = document.getElementById("baFrame");
    var after = document.getElementById("baAfter");
    var handle = document.getElementById("baHandle");
    function setPos(pct){
      pct = Math.max(0, Math.min(100, pct));
      after.style.width = pct + "%";
      handle.style.left = pct + "%";
      handle.setAttribute("aria-valuenow", Math.round(pct));
    }
    function dragMove(clientX){
      var rect = frame.getBoundingClientRect();
      var pct = ((clientX - rect.left) / rect.width) * 100;
      setPos(pct);
    }
    var dragging = false;
    handle.addEventListener("mousedown", function(){ dragging = true; });
    window.addEventListener("mouseup", function(){ dragging = false; });
    window.addEventListener("mousemove", function(e){ if(dragging) dragMove(e.clientX); });
    handle.addEventListener("touchstart", function(){ dragging = true; }, {passive:true});
    window.addEventListener("touchend", function(){ dragging = false; });
    window.addEventListener("touchmove", function(e){ if(dragging && e.touches[0]) dragMove(e.touches[0].clientX); }, {passive:true});
    handle.addEventListener("keydown", function(e){
      var current = parseFloat(after.style.width) || 52;
      if(e.key === "ArrowLeft"){ setPos(current - 5); e.preventDefault(); }
      if(e.key === "ArrowRight"){ setPos(current + 5); e.preventDefault(); }
    });

    // ----- Newsletter form -----
    var nlForm = document.getElementById("nlForm");
    var nlMsg = document.getElementById("nlMsg");
    nlForm.addEventListener("submit", function(e){
      e.preventDefault();
      var email = document.getElementById("nlEmail");
      if(!email.checkValidity()){
        nlMsg.textContent = "Please enter a valid email address.";
        nlMsg.className = "nl-msg error";
        email.focus();
        return;
      }
      nlMsg.textContent = "You're subscribed — check your inbox for 10% off.";
      nlMsg.className = "nl-msg success";
      nlForm.reset();
    });

    // ----- Scroll reveal -----
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, {threshold:0.12});
    document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });
  }

  loadSections().then(initSite).catch(function(error){
    console.error(error);
  });
})();
