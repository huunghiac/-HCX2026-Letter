document.addEventListener('DOMContentLoaded', () => {
    // --- Lấy các phần tử DOM ---
    const screenAuth = document.getElementById('screen-auth');
    const screenEnvelope = document.getElementById('screen-envelope');
    const screenLetter = document.getElementById('screen-letter');

    const inputStudentId = document.getElementById('student-id');
    const btnSubmit = document.getElementById('btn-submit');
    const errorMessage = document.getElementById('error-message');

    const btnOpen = document.getElementById('btn-open');
    const envelopeHint = document.getElementById('envelope-hint');

    const recipientName = document.getElementById('recipient-name');
    const letterText = document.getElementById('letter-text');
    const bgAudio = document.getElementById('bg-audio');
    const coverImage = document.getElementById('cover-image');
    const btnPrevCover = document.getElementById('btn-prev-cover');
    const btnNextCover = document.getElementById('btn-next-cover');

    // --- State ---
    let usersData = {};
    let currentUser = null;
    const coverImages = [
        "image/690787500_2841977942811333_4135708295660369387_n.jpg",
        "image/705312967_122100786002585519_212841117163231902_n.jpg",
        "image/706832163_122100652562585519_9113169685877924932_n.jpg",
        "image/Copy of hcx_donbien_13.png",
        "image/HCX (34 of 36).jpg",
        "image/LONGDAT-1.jpg"
    ];
    let currentCoverIndex = 0;

    // --- Khởi tạo: Lấy dữ liệu từ file JSON ---
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Không thể tải data.json');
            return response.json();
        })
        .then(data => {
            usersData = data;
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu người dùng:', error);
            // Dữ liệu mẫu dự phòng trong trường hợp fetch bị lỗi (ví dụ mở file trực tiếp không qua server)
            usersData = {
                "20520001": {
                    "name": "Nguyễn Văn A (Dự phòng)",
                    "letter": "Chào A,\n\nĐây là dữ liệu dự phòng vì không thể load JSON.",
                    "audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                }
            };
        });

    // --- Hàm tiện ích: Chuyển đổi màn hình với hiệu ứng ---
    const switchScreen = (hideScreen, showScreen) => {
        // Bắt đầu hiệu ứng fade out
        hideScreen.classList.remove('active');

        // Đợi CSS transition kết thúc rồi mới thay đổi display
        setTimeout(() => {
            hideScreen.style.display = 'none';
            showScreen.style.display = 'flex';

            // Ép trình duyệt tính toán lại layout (reflow) để chuẩn bị cho hiệu ứng fade in
            void showScreen.offsetWidth;

            // Bắt đầu hiệu ứng fade in
            showScreen.classList.add('active');
        }, 600); // 600ms khớp với thời gian transition trong CSS
    };

    // Ẩn hoàn toàn các màn hình khác khi vừa load
    screenEnvelope.style.display = 'none';
    screenLetter.style.display = 'none';

    // --- Xử lý Sự kiện ---

    // 1. Xác thực Mã số sinh viên
    const handleLogin = () => {
        const studentId = inputStudentId.value.trim();

        if (!studentId) {
            errorMessage.textContent = 'Vui lòng nhập Mã số sinh viên.';
            errorMessage.classList.remove('hidden');
            return;
        }

        if (usersData[studentId]) {
            // Thành công: Tìm thấy người dùng
            currentUser = usersData[studentId];
            errorMessage.classList.add('hidden');

            // Cập nhật câu chào trên phong thư với tên thật của sinh viên
            if (envelopeHint) {
                envelopeHint.textContent = `Hữu Nghĩa có phong thư gửi đến ${currentUser.name}`;
            }

            // Tải trước (preload) audio để phát mượt hơn trên mobile
            bgAudio.src = currentUser.audio;
            bgAudio.load();

            // Chuyển sang màn hình Mở thư (Bypass Autoplay)
            switchScreen(screenAuth, screenEnvelope);
        } else {
            // Thất bại: Không tìm thấy
            errorMessage.textContent = 'Mã số sinh viên không tồn tại hoặc chưa chính xác.';
            errorMessage.classList.remove('hidden');
        }
    };

    btnSubmit.addEventListener('click', handleLogin);

    // Hỗ trợ nhấn Enter để submit
    inputStudentId.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
        // Ẩn lỗi khi người dùng bắt đầu nhập lại
        errorMessage.classList.add('hidden');
    });

    // --- Hàm điều khiển ảnh cover ---
    const updateCoverImage = (index) => {
        coverImage.style.opacity = 0;
        setTimeout(() => {
            coverImage.src = coverImages[index];
            coverImage.style.opacity = 1;
        }, 150);
    };

    btnPrevCover.addEventListener('click', () => {
        currentCoverIndex = (currentCoverIndex - 1 + coverImages.length) % coverImages.length;
        updateCoverImage(currentCoverIndex);
    });

    btnNextCover.addEventListener('click', () => {
        currentCoverIndex = (currentCoverIndex + 1) % coverImages.length;
        updateCoverImage(currentCoverIndex);
    });

    // 2. Mở thư và phát nhạc (Bypass Browser Autoplay Policy)
    btnOpen.addEventListener('click', () => {
        if (!currentUser) return;

        // Bắt buộc phải có tương tác của người dùng (click) thì trình duyệt mới cho phép phát âm thanh
        bgAudio.play().catch(e => {
            console.error('Không thể tự động phát nhạc:', e);
        });

        // Đổ dữ liệu thư vào giao diện
        recipientName.textContent = `Thân gửi ${currentUser.name},`;
        letterText.textContent = currentUser.letter;

        // Khởi tạo ảnh cover đầu tiên
        currentCoverIndex = 0;
        updateCoverImage(currentCoverIndex);

        // Chuyển sang màn hình Nội dung thư
        switchScreen(screenEnvelope, screenLetter);
    });
});
