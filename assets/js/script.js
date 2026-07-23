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

  var products = [
  {
    name: "AXIS-Y dark spot serum",
    tag: "Best seller",
    price: 25,
    old: null,
    rating: "★★★★★ 4.9 (312)",
    stock: "Only 6 left",
    color: "var(--sage)",
    image: "assets/images/AXIS-Y dark spot serum.jpeg"
  },
    {name:"CeraVe Hydrating Facial Cleanser", tag:"New", price:18, old:22, rating:"★★★★★ 4.8 (198)", stock:null, color:"var(--beige)"},
    {name:"The Ordinary Niacinamide 10%", tag:"Trending", price:9, old:null, rating:"★★★★☆ 4.6 (140)", stock:null, color:"var(--pink)"},
    {name:"Eucerin Daily Hydration SPF 50", tag:"Best seller", price:21, old:null, rating:"★★★★★ 4.9 (401)", stock:"Only 4 left", color:"#EFEFEF"},
    {name:"Bioderma Sensibio Gel Moussant", tag:"Daily cleanse", price:16, old:null, rating:"★★★★★ 4.8 (226)", stock:null, color:"var(--beige)"},
    {name:"Avene Thermal Spring Water", tag:"Hydration", price:15, old:null, rating:"★★★★☆ 4.7 (151)", stock:"Only 9 left", color:"var(--pink)"},
    {name:"SkinCeuticals CE Ferulic", tag:"Favorite", price:182, old:null, rating:"★★★★★ 4.9 (189)", stock:null, color:"var(--sage)"},
    {name:"Fenty Beauty Eaze Drop Blurring Skin Tint", tag:"Glow finish", price:38, old:45, rating:"★★★★★ 4.8 (204)", stock:null, color:"#EAE7DE"}
  ];

  var state = loadState();
  var currentQuery = "";
  var toastTimer;

  function loadState(){
    try {
      var saved = JSON.parse(localStorage.getItem("verreTerreStore")) || {};
      return {
        cart: saved.cart || {},
        favorites: saved.favorites || {},
        profile: saved.profile || {name:"", email:""}
      };
    } catch (error) {
      return {cart:{}, favorites:{}, profile:{name:"", email:""}};
    }
  }

  function saveState(){
    localStorage.setItem("verreTerreStore", JSON.stringify(state));
  }

  function formatMoney(value){
    return "₼" + value;
  }

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

  function renderProductGrid(){
    var grid = document.getElementById("productGrid");
    if(!grid){ return; }

    var filtered = products.filter(function(product){
      var searchText = currentQuery.trim().toLowerCase();
      if(!searchText){ return true; }
      return product.name.toLowerCase().includes(searchText) || product.tag.toLowerCase().includes(searchText);
    });

    grid.innerHTML = "";

    if(!filtered.length){
      grid.innerHTML = '<div class="no-results">No products match “' + currentQuery + '”. Try serum, SPF, or balm.</div>';
      return;
    }

    filtered.forEach(function(product){
      var card = document.createElement("div");
      var isFavorite = Boolean(state.favorites[product.name]);
      card.className = "prod-card reveal";
      card.innerHTML =
        '<div class="prod-media" style="background:' + product.color + '22;">' +
          (product.stock ? '<span class="stock-flag">' + product.stock + '</span>' : '') +
          '<div class="quick-actions">' +
            '<button class="qa-btn" aria-label="Quick view ' + product.name + '"><svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg></button>' +
            '<button class="qa-btn wish-btn ' + (isFavorite ? 'active' : '') + '" data-product-name="' + product.name + '" aria-label="Toggle ' + product.name + ' wishlist" aria-pressed="' + isFavorite + '"><svg viewBox="0 0 24 24"><path d="M20.8 4.6c-1.9-1.9-5-1.9-6.9 0L12 5.5l-1.9-.9c-1.9-1.9-5-1.9-6.9 0-1.9 1.9-1.9 5 0 6.9L12 21l8.8-8.9c1.9-1.9 1.9-5 0-6.9z"/></svg></button>' +
          '</div>' +
          (product.image
            ? '<img class="prod-image" src="' + product.image + '" alt="' + product.name + '">'
            : '<div class="swatch"><svg class="bottle" viewBox="0 0 80 140"><rect class="glass" x="18" y="24" width="44" height="100" rx="12"/><rect class="liquid" x="18" y="70" width="44" height="54" rx="8" fill="' + product.color + '"/><rect x="28" y="6" width="24" height="20" rx="5" fill="#2B2B2B" opacity="0.85"/></svg></div>') +
        '</div>' +
        '<div class="prod-info">' +
          '<span class="tag">' + product.tag + '</span>' +
          '<h4>' + product.name + '</h4>' +
          '<div class="rating">' + product.rating + '</div>' +
          '<div class="prod-price"><span>' + formatMoney(product.price) + '</span>' + (product.old ? '<span class="old">' + formatMoney(product.old) + '</span>' : '') + '</div>' +
          '<button class="add-cart-mini" data-name="' + product.name + '">Add to Cart</button>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  function updateHeaderCounts(){
    var cartCount = document.getElementById("cartCount");
    var wishlistCount = document.getElementById("wishlistCount");
    var favoritePanelCount = document.getElementById("favoritePanelCount");
    var totalItems = Object.values(state.cart).reduce(function(sum, qty){ return sum + qty; }, 0);
    var favoriteCount = Object.keys(state.favorites).length;

    if(cartCount){ cartCount.textContent = String(totalItems); }
    if(wishlistCount){ wishlistCount.textContent = String(favoriteCount); }
    if(favoritePanelCount){ favoritePanelCount.textContent = String(favoriteCount); }
  }

  function syncFavoriteButtonStates(){
    document.querySelectorAll(".wish-btn").forEach(function(button){
      var productName = button.dataset.productName;
      var isFavorite = Boolean(state.favorites[productName]);
      button.classList.toggle("active", isFavorite);
      button.setAttribute("aria-pressed", String(isFavorite));
    });
  }

  function renderFavoritePanel(){
    var favoritePanelItems = document.getElementById("favoritePanelItems");
    if(!favoritePanelItems){ return; }

    var favoriteNames = Object.keys(state.favorites);
    favoritePanelItems.innerHTML = "";

    if(!favoriteNames.length){
      favoritePanelItems.innerHTML = '<div class="favorite-empty">Tap the heart on a product to save it here.</div>';
      updateHeaderCounts();
      return;
    }

    favoriteNames.forEach(function(name){
      var row = document.createElement("div");
      row.className = "favorite-panel-item";
      row.innerHTML = '<span>' + name + '</span><span>saved</span>';
      favoritePanelItems.appendChild(row);
    });

    updateHeaderCounts();
  }

  function renderBasket(){
    var basketItems = document.getElementById("basketItems");
    var basketTotal = document.getElementById("basketTotal");
    if(!basketItems || !basketTotal){ return; }

    var total = 0;
    var itemEntries = Object.keys(state.cart).map(function(name){
      var item = products.find(function(product){ return product.name === name; });
      if(!item){ return null; }
      var quantity = state.cart[name];
      total += item.price * quantity;
      return {
        name: item.name,
        price: item.price,
        quantity: quantity,
        color: item.color
      };
    }).filter(Boolean);

    basketItems.innerHTML = "";

    if(!itemEntries.length){
      basketItems.innerHTML = '<div class="basket-empty">Your basket is empty. Add a serum or cleanser to get started.</div>';
      basketTotal.textContent = formatMoney(0);
      updateHeaderCounts();
      return;
    }

    itemEntries.forEach(function(item){
      var basketItem = document.createElement("div");
      basketItem.className = "basket-item";
      basketItem.innerHTML =
        '<div class="basket-thumb" style="background:' + item.color + '22;"></div>' +
        '<div>' +
          '<strong>' + item.name + '</strong>' +
          '<span>' + formatMoney(item.price) + ' each</span>' +
        '</div>' +
        '<div class="basket-qty">' +
          '<button type="button" data-cart-delta="-1" data-name="' + item.name + '">−</button>' +
          '<span>' + item.quantity + '</span>' +
          '<button type="button" data-cart-delta="1" data-name="' + item.name + '">+</button>' +
        '</div>';
      basketItems.appendChild(basketItem);
    });

    basketTotal.textContent = formatMoney(total);
    updateHeaderCounts();
  }

  function showToast(msg){
    var toast = document.getElementById("toast");
    var toastMsg = document.getElementById("toastMsg");
    if(!toast || !toastMsg){ return; }
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove("show"); }, 2400);
  }

  function addToCart(name){
    state.cart[name] = Number(state.cart[name] || 0) + 1;
    saveState();
    renderBasket();
    showToast("Added " + name + " to basket");
  }

  function updateCartQuantity(name, delta){
    var current = Number(state.cart[name] || 0);
    var next = current + delta;
    if(next <= 0){ delete state.cart[name]; }
    else { state.cart[name] = next; }
    saveState();
    renderBasket();
  }

  function toggleFavorite(name){
    if(state.favorites[name]){ delete state.favorites[name]; showToast("Removed " + name + " from wishlist"); }
    else { state.favorites[name] = true; showToast("Saved " + name + " to wishlist"); }
    saveState();
    syncFavoriteButtonStates();
    renderFavoritePanel();
    updateHeaderCounts();
  }

  function initHeaderControls(){
    var searchButton = document.querySelector('[data-action="toggle-search"]');
    var searchPanel = document.getElementById("searchPanel");
    var searchInput = document.getElementById("siteSearch");
    var closeSearch = document.querySelector('[data-close-search]');
    var profileButton = document.querySelector('[data-action="toggle-profile"]');
    var profilePanel = document.getElementById("profilePanel");
    var profileForm = document.getElementById("profileForm");
    var profileName = document.getElementById("profileName");
    var profileEmail = document.getElementById("profileEmail");
    var favoriteButton = document.querySelector('[data-action="toggle-favorites"]');
    var favoritePanel = document.getElementById("favoritePanel");
    var cartButton = document.querySelector('[data-action="toggle-basket"]');
    var basketDrawer = document.getElementById("basketDrawer");
    var closeBasket = document.querySelector('[data-close-basket]');
    var scrim = document.getElementById("navScrim");
    var burger = document.getElementById("burgerBtn");
    var mobileNav = document.getElementById("mobileNav");
    var closeDrawer = document.getElementById("closeDrawer");

    function closeAllPanels(){
      if(searchPanel){ searchPanel.hidden = true; }
      if(profilePanel){ profilePanel.hidden = true; }
      if(favoritePanel){ favoritePanel.classList.remove("open"); favoritePanel.setAttribute("aria-hidden", "true"); }
      if(basketDrawer){ basketDrawer.classList.remove("open"); basketDrawer.setAttribute("aria-hidden", "true"); }
      if(scrim){ scrim.classList.remove("show"); }
      if(mobileNav){ mobileNav.classList.remove("open"); }
    }

    if(searchButton && searchPanel){
      searchButton.addEventListener("click", function(){
        closeAllPanels();
        searchPanel.hidden = false;
        scrim.classList.add("show");
        setTimeout(function(){ searchInput.focus(); }, 30);
      });
    }

    if(closeSearch){
      closeSearch.addEventListener("click", function(){
        searchPanel.hidden = true;
        scrim.classList.remove("show");
      });
    }

    if(profileButton && profilePanel){
      profileButton.addEventListener("click", function(){
        closeAllPanels();
        profilePanel.hidden = false;
        scrim.classList.add("show");
        if(profileName){ profileName.value = state.profile.name || ""; }
        if(profileEmail){ profileEmail.value = state.profile.email || ""; }
      });
    }

    if(favoriteButton && favoritePanel){
      favoriteButton.addEventListener("click", function(){
        var isOpen = favoritePanel.classList.contains("open");
        closeAllPanels();
        if(!isOpen){
          favoritePanel.classList.add("open");
          favoritePanel.setAttribute("aria-hidden", "false");
          scrim.classList.add("show");
        }
      });
    }

    if(profileForm){
      profileForm.addEventListener("submit", function(e){
        e.preventDefault();
        state.profile = {
          name: profileName.value.trim(),
          email: profileEmail.value.trim()
        };
        saveState();
        profilePanel.hidden = true;
        scrim.classList.remove("show");
        showToast("Profile saved for " + state.profile.name);
      });
    }

    if(cartButton && basketDrawer){
      cartButton.addEventListener("click", function(){
        closeAllPanels();
        basketDrawer.classList.add("open");
        basketDrawer.setAttribute("aria-hidden", "false");
        scrim.classList.add("show");
      });
    }

    if(closeBasket){
      closeBasket.addEventListener("click", function(){
        basketDrawer.classList.remove("open");
        basketDrawer.setAttribute("aria-hidden", "true");
        scrim.classList.remove("show");
      });
    }

    if(scrim){
      scrim.addEventListener("click", closeAllPanels);
    }

    if(burger && mobileNav && closeDrawer){
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
      document.addEventListener("keydown", function(e){
        if(e.key === "Escape" && mobileNav.classList.contains("open")) closeNav();
      });
      mobileNav.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeNav); });
    }

    if(searchInput){
      searchInput.addEventListener("input", function(e){
        currentQuery = e.target.value.trim();
        renderProductGrid();
      });
    }

    document.addEventListener("click", function(e){
      var addButton = e.target.closest(".add-cart-mini");
      if(addButton){
        addToCart(addButton.dataset.name);
      }

      var wishButton = e.target.closest(".wish-btn");
      if(wishButton){
        toggleFavorite(wishButton.dataset.productName || wishButton.closest(".prod-card").querySelector("h4").textContent);
      }

      var cartDeltaButton = e.target.closest("[data-cart-delta]");
      if(cartDeltaButton){
        updateCartQuantity(cartDeltaButton.dataset.name, Number(cartDeltaButton.dataset.cartDelta));
      }
    });

    document.addEventListener("keydown", function(e){
      if(e.key === "Escape"){
        if(searchPanel && !searchPanel.hidden){ searchPanel.hidden = true; scrim.classList.remove("show"); }
        if(profilePanel && !profilePanel.hidden){ profilePanel.hidden = true; scrim.classList.remove("show"); }
        if(favoritePanel && favoritePanel.classList.contains("open")){ favoritePanel.classList.remove("open"); favoritePanel.setAttribute("aria-hidden", "true"); scrim.classList.remove("show"); }
        if(basketDrawer && basketDrawer.classList.contains("open")){ basketDrawer.classList.remove("open"); basketDrawer.setAttribute("aria-hidden", "true"); scrim.classList.remove("show"); }
      }
    });
  }

  function initSite(){
    renderProductGrid();
    renderBasket();
    renderFavoritePanel();
    syncFavoriteButtonStates();
    updateHeaderCounts();
    initHeaderControls();

    document.querySelectorAll("[data-ripple]").forEach(function(el){
      el.addEventListener("click", function(){
        el.classList.remove("rippling");
        void el.offsetWidth;
        el.classList.add("rippling");
      });
    });

    var header = document.getElementById("siteHeader");
    window.addEventListener("scroll", function(){
      header.classList.toggle("scrolled", window.scrollY > 12);
    }, {passive:true});

    document.querySelectorAll(".concern-pill").forEach(function(pill){
      pill.addEventListener("click", function(){
        document.querySelectorAll(".concern-pill").forEach(function(p){ p.classList.remove("active"); });
        pill.classList.add("active");
      });
    });

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

    var nlForm = document.getElementById("nlForm");
    var nlMsg = document.getElementById("nlMsg");
    if(nlForm){
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
    }

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
