function initImageControl(){
    // image Uploader
    let numberOfDrag = 0;
    $('.fileUploader').on('dragover', false);
    $('.fileUploader').on("dragenter", function (event) {
        event.originalEvent.preventDefault();
        event.stopPropagation();

        $('.fileUploader').addClass('active');
        numberOfDrag++;
    });   
    
    $('.fileUploader').on("dragleave", function (event) {
        event.originalEvent.preventDefault();
        event.stopPropagation();

        numberOfDrag--;
        if (numberOfDrag == 0) {
            $('.fileUploader').removeClass('active');
        }
    });

    $('.drop').on('drop', function (event) {
        event.originalEvent.preventDefault();
        event.stopPropagation()
        $('fileUploader').removeClass('active');

        let files = event.originalEvent.dataTransfer.files;
        console.log(files.length);
        if (files.length > 1) {
            $('#imageFeedback').text("Vous ne pouvez pas mettre plusieurs images");
            $('.fileUploader').removeClass('active');
        } else {
            if (checkFile(files[0])) {
                document.querySelector('input[type=file]').files = files;
            }
        }
    });

    $('.fileUploader').on('click', function (e) {
        $('input[type="file"]').click();
    });

    $('input[type="file"]').on('change', function () {
        previewFile();
    });

    if($('.img-preview').attr('src') != ''){
            displayImage(null);
    }
    function displayImage(image) {
        if (image != null) { $('.img-preview').attr('src', image);}

        $(".fileUploader-content").each(function () {
            $(this).hide();
        });
        $('.fileUploader').removeClass('active');
        $('.fileUploader').addClass('active-image');
        $('.img-preview').show();

        $('.image-close').show();
    }
    function checkFile(file) {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png','image/bmp','image/webp'];
        console.log(file.type);

        if (allowedMimes.includes(file.type)) {
                //image is Ok

                //$('input[type="file"]').files=file;
                $('#imageFeedback').text("");
                let reader = new FileReader();

                reader.onloadend = function () {
                    displayImage(reader.result);
                    $('#Image').val(reader.result);
                }
                reader.readAsDataURL(file);
                return true;
            
        } else {
            $('#imageFeedback').text("Le fichier doit être une image");
            $('.fileUploader').removeClass('active');

        }
        return false;
    }
    function previewFile() {
        var preview = $(".img-preview");
        console.log($(".img-preview"));
        var file = document.querySelector('input[type=file]').files[0];
        checkFile(file);
    }
}