/**
 * 1. HÀM NẠP LAYOUT DÙNG CHUNG (HEADER/FOOTER)
 */
async function loadLayout() {
    try {
        const isEnPage = window.location.pathname.includes('-en.html');

        // Nạp Header
        const headerRes = await fetch(isEnPage ? 'Header-en.html' : 'Header.html');
        const headerData = await headerRes.text();
        document.getElementById('header-placeholder').innerHTML = headerData;

        // Nạp Footer
        const footerRes = await fetch(isEnPage ? 'Footer-en.html' : 'Footer.html');
        const footerData = await footerRes.text();
        document.getElementById('footer-placeholder').innerHTML = footerData;

        // Kích hoạt các tính năng sau khi nạp xong HTML
        initMenuLogic();
        initMobileMenuLogic();
        initSearchLogic();
        initEmailFormLogic();
        initLangLogic();
        initMainContactForm(); 
        initNewsLogic(); 
        initJobFilterLogic();

    } catch (error) {
        console.error("Lỗi khi nạp layout:", error);
    }
}

function initMobileMenuLogic() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.menu');
    const headerRight = document.querySelector('.header-right');

    if (!toggle || !menu) return;

    const closeMenu = () => {
        menu.classList.remove('open');
        headerRight?.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.classList.remove('mobile-menu-open');
    };

    const openMenu = () => {
        menu.classList.add('open');
        headerRight?.classList.add('open');
        toggle.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.innerHTML = '<i class="fas fa-times"></i>';
        document.body.classList.add('mobile-menu-open');
    };

    toggle.addEventListener('click', () => {
        if (menu.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    document.addEventListener('click', (event) => {
        if (!document.body.classList.contains('mobile-menu-open')) return;

        const clickedInsideMenu = menu.contains(event.target);
        const clickedInsideHeaderTools = headerRight?.contains(event.target);
        const clickedToggle = toggle.contains(event.target);

        if (!clickedInsideMenu && !clickedInsideHeaderTools && !clickedToggle) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) closeMenu();
    });
}

/**
 * 2. LOGIC MENU & HEADER SCROLL (Hỗ trợ Dropdown & Trang chi tiết)
 */
function initMenuLogic() {
    let currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "" || currentPage === "/") currentPage = "index.html";
    const currentBasePage = currentPage.replace('-en.html', '.html');

    const menuLinks = document.querySelectorAll('.menu a');

    // Các dấu hiệu nhận biết trang chi tiết
    const isJobDetailPage = document.querySelector('.job-detail-page') !== null;
    const isNewsDetailPage = document.querySelector('.news-detail-page') !== null;
    const isServiceDetailPage = document.querySelector('.service-detail-page') !== null;

    // Danh sách các file con của Lĩnh vực hoạt động (Dropdown)
    const serviceSubPages = ["Bat_dong_san.html", "Tai_chinh.html", "Cong_nghiep.html", "Nong_nghiep.html", "Xuat-nhap-khau.html"];

    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const hrefBase = href.replace('-en.html', '.html');

        // 1. Khớp chính xác tên file
        const isExactMatch = (href === currentPage);

        // 2. Logic Active cho trang Tuyển dụng & Tin tức
        const isJobActive = hrefBase.includes("Tuyen_dung.html") && isJobDetailPage;
        const isNewsActive = hrefBase.includes("Tin_tuc.html") && isNewsDetailPage;

        // 3. Logic Active cho Lĩnh vực hoạt động (Bao gồm cả khi ở trang con của dropdown)
        const isServiceActive = hrefBase.includes("Linh_vuc.html") && (isServiceDetailPage || serviceSubPages.includes(currentBasePage));

        if (isExactMatch || isJobActive || isNewsActive || isServiceActive) {
            link.classList.add('active');
        } else {
            // Lưu ý: Chỉ remove active nếu link đó không phải là menu cha của trang hiện tại
            link.classList.remove('active');
        }
    });
}

/**
 * 3. LOGIC TÌM KIẾM
 */
function initSearchLogic() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && this.value) {
                alert("Đang tìm kiếm nội dung: " + this.value);
            }
        });
    }
}

/**
 * 4. XỬ LÝ FORM LIÊN HỆ CHÍNH (SỬA LỖI ĐỨNG FORM)
 */
function initMainContactForm() {
    const mainForm = document.getElementById('mainContactForm');
    const statusMsg = document.getElementById('contact-status');

    if (!mainForm || !statusMsg) return;

    mainForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        const response = grecaptcha.getResponse();
        if (response.length === 0) {
            alert("Vui lòng xác nhận bạn không phải là người máy!");
            return;
        }
        const btn = mainForm.querySelector('button');
        const originalBtnText = btn.innerText;

        btn.innerText = "ĐANG GỬI...";
        btn.disabled = true;

        // Tạo dữ liệu từ Form
        const formData = new FormData(mainForm);

        // --- THÊM DÒNG NÀY ĐỂ LẤY URL HIỆN TẠI ---
        formData.append("pageUrl", window.location.href); 
        // ----------------------------------------

        fetch(mainForm.action, {
            method: 'POST',
            mode: 'no-cors', 
            body: new URLSearchParams(formData)
        })
        .then(() => {
            statusMsg.innerText = "Cảm ơn bạn! Yêu cầu đã được gửi thành công.";
            statusMsg.style.backgroundColor = "#d4edda";
            statusMsg.style.color = "#155724";
            statusMsg.style.border = "1px solid #c3e6cb";
            statusMsg.style.display = "block";
            
            mainForm.reset();
            grecaptcha.reset(); // Nên reset cả reCAPTCHA nữa
            btn.innerText = originalBtnText;
            btn.disabled = false;

            setTimeout(() => {
                statusMsg.style.display = "none";
            }, 5000);
        })
        .catch(error => {
            statusMsg.innerText = "Có lỗi xảy ra. Vui lòng thử lại sau!";
            statusMsg.style.backgroundColor = "#f8d7da";
            statusMsg.style.color = "#721c24";
            statusMsg.style.display = "block";
            btn.disabled = false;
            btn.innerText = originalBtnText;
        });
    });
}

/**
 * 5. LOGIC ĐĂNG KÝ EMAIL (FOOTER)
 */
function initEmailFormLogic() {
    const form = document.getElementById('emailForm');
    const messageBox = document.getElementById('form-message');

    if (!form || !messageBox) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const emailInput = form.querySelector('input[name="email"]');
        
        btn.innerHTML = "Đang gửi...";
        btn.disabled = true;

        // --- SỬA TẠI ĐÂY ---
        fetch(form.action, {
            method: 'POST',
            mode: 'no-cors',
            body: new URLSearchParams({ 
                email: emailInput.value,
                pageUrl: window.location.href // Thêm dòng này để lấy link
            })
        })
        // -------------------
        .then(() => {
            messageBox.innerText = "Đăng ký nhận tin thành công!";
            messageBox.style.color = "#00ff00";
            messageBox.style.display = "block";
            form.reset();
            btn.innerHTML = "Đăng ký";
            btn.disabled = false;
            setTimeout(() => { messageBox.style.display = "none"; }, 5000);
        })
        .catch(() => {
            messageBox.innerText = "Lỗi. Thử lại sau!";
            messageBox.style.display = "block";
            btn.disabled = false;
            btn.innerHTML = "Đăng ký";
        });
    });
}



/**
 * 6. LOGIC CHUYỂN NGÔN NGỮ
 */
function changeLang(lang) {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    let targetPage = "";

    if (lang === 'en') {
        targetPage = currentPage.includes('-en.html') ? currentPage : currentPage.replace('.html', '-en.html');
        if (currentPage === "index.html") targetPage = "index-en.html";
    } else {
        targetPage = currentPage.replace('-en.html', '.html');
        if (currentPage === "index-en.html") targetPage = "index.html";
    }
    window.location.href = targetPage;
}

function initLangLogic() {
    const isEn = window.location.pathname.includes('-en.html');
    const viBtn = document.getElementById('lang-vi');
    const enBtn = document.getElementById('lang-en');

    if (viBtn) viBtn.classList.toggle('active', !isEn);
    if (enBtn) enBtn.classList.toggle('active', isEn);
}

/**
 * 7. LOGIC HIỂN THỊ TIN TỨC TỪ JSON (ARCHIVE)
 */
async function initNewsLogic() {
    const newsGrid = document.querySelector('.news-grid');
    const isEn = window.location.pathname.includes('-en.html');
    
    // Kiểm tra nếu trang hiện tại có chứa khung hiển thị tin tức thì mới chạy
    if (!newsGrid) return;

    try {
        // Đường dẫn file JSON chứa danh sách bài báo
        const response = await fetch(isEn ? 'news-data-en.json' : 'news-data.json');
        if (!response.ok) throw new Error(isEn ? "Unable to load news data" : "Không thể tải file dữ liệu tin tức");
        
        const newsData = await response.json();

        // Xóa nội dung cũ (nếu có) trước khi đổ dữ liệu mới
        newsGrid.innerHTML = '';

        newsData.forEach(item => {
            const newsHTML = `
                <article class="news-item">
                    <div class="news-thumb">
                        <a href="${item.link}">
                            <img src="${item.image}" alt="${item.title}" onerror="this.src='images/default-news.jpg'">
                        </a>
                        <span class="news-category">${item.category}</span>
                    </div>
                    <div class="news-info">
                        <span class="news-date"><i class="far fa-calendar-alt"></i> ${item.date}</span>
                        <div class="news-title-wrapper">
                            <h3><a href="${item.link}">${item.title}</a></h3>
                        </div>
                        <div class="news-excerpt-wrapper">
                            <p class="news-excerpt">${item.excerpt}</p>
                        </div>
                        <a href="${item.link}" class="read-more-link">${isEn ? 'Read more' : 'Xem thêm'} <i class="fas fa-long-arrow-alt-right"></i></a>
                    </div>
                </article>
            `;
            newsGrid.insertAdjacentHTML('beforeend', newsHTML);
        });
    } catch (error) {
        console.error(isEn ? "Error loading news:" : "Lỗi khi nạp tin tức:", error);
        newsGrid.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">${isEn ? 'No news is available at the moment.' : 'Hiện tại chưa có tin tức mới nhất.'}</p>`;
    }
}

/**
 * 8. LOGIC LỌC TUYỂN DỤNG (THEO VỊ TRÍ & ĐỊA ĐIỂM)
 */
function initJobFilterLogic() {
    const positionFilter = document.getElementById('position-filter');
    const locationFilter = document.getElementById('location-filter');
    // Lấy tất cả hàng trong body của bảng tuyển dụng
    const tableRows = document.querySelectorAll('.recruitment-table tbody tr');

    // Nếu không tìm thấy các phần tử lọc thì thoát hàm
    if (!positionFilter || !locationFilter || tableRows.length === 0) return;

    function filterJobs() {
        const selectedPos = positionFilter.value; // Lấy giá trị từ select Vị trí
        const selectedLoc = locationFilter.value; // Lấy giá trị từ select Địa điểm

        tableRows.forEach(row => {
            const rowPos = row.getAttribute('data-position');
            const rowLoc = row.getAttribute('data-location');

            // ĐIỀU KIỆN LỌC THÔNG MINH:
            // Nếu người dùng không chọn (giá trị là "") -> Luôn đúng (True)
            // Nếu người dùng có chọn -> Phải khớp chính xác với data-attribute
            const isPosMatch = !selectedPos || rowPos === selectedPos;
            const isLocMatch = !selectedLoc || rowLoc === selectedLoc;

            // Chỉ hiển thị nếu THỎA MÃN CẢ HAI (hoặc cả hai đều không chọn)
            if (isPosMatch && isLocMatch) {
                row.style.display = ""; 
            } else {
                row.style.display = "none";
            }
        });
    }

    // Lắng nghe sự kiện thay đổi trên cả 2 ô chọn
    positionFilter.addEventListener('change', filterJobs);
    locationFilter.addEventListener('change', filterJobs);
}

// KHỞI CHẠY
document.addEventListener('DOMContentLoaded', loadLayout);
