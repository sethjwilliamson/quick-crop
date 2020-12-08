window.onload = function () {

    'use strict';

    var FileSaver = window.FileSaver;
    var JSZip = window.JSZip;

    var Cropper = window.Cropper;
    var URL = window.URL || window.webkitURL;
    var container = document.querySelector('.img-container');
    var image = container.getElementsByTagName('img').item(0);
    var actions = document.getElementById('actions');
    var dataX = document.getElementById('dataX');
    var dataY = document.getElementById('dataY');
    var dataHeight = document.getElementById('dataHeight');
    var dataWidth = document.getElementById('dataWidth');
    var dataRotate = document.getElementById('dataRotate');
    var dataScaleX = document.getElementById('dataScaleX');

    console.log(document.getElementById('aspect1'));
    var options = {
        aspectRatio: document.getElementById('aspect1').value / document.getElementById('aspect2').value,
        preview: '.img-preview',
        ready: function (e) {
            console.log(e.type);
        },
        cropstart: function (e) {
            console.log(e.type, e.detail.action);
        },
        cropmove: function (e) {
            console.log(e.type, e.detail.action);
        },
        cropend: function (e) {
            console.log(e.type, e.detail.action);
        },
        crop: function (e) {
            var data = e.detail;

            console.log(e.type);
            dataX.value = Math.round(data.x);
            dataY.value = Math.round(data.y);
            dataHeight.value = Math.round(data.height);
            dataWidth.value = Math.round(data.width);
            dataRotate.value = typeof data.rotate !== 'undefined' ? data.rotate : '';
            dataScaleX.value = typeof data.scaleX !== 'undefined' ? data.scaleX : '';
            dataScaleY.value = typeof data.scaleY !== 'undefined' ? data.scaleY : '';
        },
        zoom: function (e) {
            console.log(e.type, e.detail.ratio);
        }
    };
    var cropper = new Cropper(image, options);
    var originalImageURL = image.src;
    var uploadedImageType = 'image/jpeg';
    var uploadedImageURL;

    var fileName;
    var arrayCroppedImages = [];
    var arrayUncroppedImages = [];
    var scaleX = 1;

    // Tooltip
    $('[data-toggle="tooltip"]').tooltip();

    // Buttons
    if (!document.createElement('canvas').getContext) {
        $('button[data-method="getCroppedCanvas"]').prop('disabled', true);
    }

    if (typeof document.createElement('cropper').style.transition === 'undefined') {
        $('button[data-method="rotate"]').prop('disabled', true);
        $('button[data-method="scale"]').prop('disabled', true);
    }

    // Download
    //if (typeof download.download === 'undefined') {
    //    download.className += ' disabled';
    //}

    // Options
    actions.querySelector('.docs-toggles').onchange = function (event) {
        var e = event || window.event;
        var target = e.target || e.srcElement;
        var cropBoxData;
        var canvasData;
        var isCheckbox;
        var isRadio;

        if (!cropper) {
            return;
        }

        if (target.tagName.toLowerCase() === 'label') {
            target = target.querySelector('input');
        }

        isCheckbox = target.type === 'checkbox';
        isRadio = target.type === 'radio';

        if (isCheckbox || isRadio) {
            if (isCheckbox) {
                options[target.name] = target.checked;
                cropBoxData = cropper.getCropBoxData();
                canvasData = cropper.getCanvasData();

                options.ready = function () {
                    console.log('ready');
                    cropper.setCropBoxData(cropBoxData).setCanvasData(canvasData);
                };
            } else {
                options[target.name] = target.value;
                options.ready = function () {
                    console.log('ready');
                };
            }

            // Restart
            cropper.destroy();
            cropper = new Cropper(image, options);
        }
    };

    // Methods
    actions.querySelector('.docs-buttons').onclick = function (event) {
        var e = event || window.event;
        var target = e.target || e.srcElement;
        var cropped;
        var result;
        var input;
        var data;

        if (!cropper) {
            return;
        }

        while (target !== this) {
            if (target.getAttribute('data-method')) {
                break;
            }

            target = target.parentNode;
        }

        if (target === this || target.disabled || target.className.indexOf('disabled') > -1) {
            return;
        }

        data = {
            method: target.getAttribute('data-method'),
            target: target.getAttribute('data-target'),
            option: target.getAttribute('data-option') || undefined,
            secondOption: target.getAttribute('data-second-option') || undefined
        };

        cropped = cropper.cropped;

        if (data.method) {
            if (typeof data.target !== 'undefined') {
                input = document.querySelector(data.target);

                if (!target.hasAttribute('data-option') && data.target && input) {
                    try {
                        data.option = JSON.parse(input.value);
                    } catch (e) {
                        console.log(e.message);
                    }
                }
            }

            switch (data.method) {
                case 'rotate':
                    if (cropped) {
                        cropper.clear();
                    }

                    break;

                case 'getCroppedCanvas':
                    try {
                        data.option = JSON.parse(data.option);
                    } catch (e) {
                        console.log(e.message);
                    }

                    if (uploadedImageType === 'image/jpeg') {
                        if (!data.option) {
                            data.option = {};
                        }

                        data.option.fillColor = '#fff';
                    }

                    break;

                case 'download':
                    return download();
            }

            if (data.method == "setAspectRatio") {
                console.log(document.getElementById('aspect1').value)
                if (document.getElementById('aspect1').value !== "" && document.getElementById('aspect2').value !== "") {
                    cropper.setAspectRatio(document.getElementById('aspect1').value / document.getElementById('aspect2').value);
                    options.aspectRatio = document.getElementById('aspect1').value / document.getElementById('aspect2').value;
                }
                else
                    cropper.setAspectRatio(null);
            }
            else {
                result = cropper[data.method](data.option, data.secondOption);
            }

            switch (data.method) {
                case 'rotate':
                    if (cropped) {
                        cropper.crop();
                    }

                    break;

                case 'scaleX':
                case 'scaleY':
                    target.setAttribute('data-option', -data.option);
                    break;

                
                

                case 'getCroppedCanvas':
                    if (result) {
                        console.log(typeof(result))
                        arrayCroppedImages.push({"file": result.toDataURL(uploadedImageType), "name": fileName});

                        console.log(result)
                        //options.width = result.width
                        //options.height = result.height
                        options.data=cropper.getData();
                        options.autoCrop = true;

                        nextImage();
                    }

                    break;

                case 'destroy':
                    cropper = null;

                    if (uploadedImageURL) {
                        URL.revokeObjectURL(uploadedImageURL);
                        uploadedImageURL = '';
                        image.src = originalImageURL;
                    }

                    break;
            }

            if (typeof result === 'object' && result !== cropper && input) {
                try {
                    input.value = JSON.stringify(result);
                } catch (e) {
                    console.log(e.message);
                }
            }
        }
    };

    document.body.onkeydown = function (event) {
        var e = event || window.event;

        if (!cropper || this.scrollTop > 300) {
            return;
        }

        switch (e.keyCode) {
            case 70:
                e.preventDefault();
                console.log(cropper)
                dataScaleX = -scaleX;
                cropper.scaleX(scaleX);
                break;
            case 32:
                e.preventDefault();
                nextImage();
                break;
            case 13:
                e.preventDefault();
                nextImage();
                break;
            case 37:
                e.preventDefault();
                cropper.move(-1, 0);
                break;

            case 38:
                e.preventDefault();
                cropper.move(0, -1);
                break;

            case 39:
                e.preventDefault();
                cropper.move(1, 0);
                break;

            case 40:
                e.preventDefault();
                cropper.move(0, 1);
                break;
        }
    };

    // Import image
    var inputImage = document.getElementById('inputImage');

    if (URL) {
        inputImage.onchange = function () {
            var files = this.files;
            var file;
            arrayUncroppedImages = []
            //var file;

            if (cropper && files && files.length) {
                //file = files[0];

                for (file of files) {
                    console.log(file)
                    if (/^image\/\w+/.test(file.type)) {
                        uploadedImageType = file.type;
    
                        if (uploadedImageURL) {
                            URL.revokeObjectURL(uploadedImageURL);
                        }
    
                        arrayUncroppedImages.push(file);
                    } else {
                        window.alert('Please choose an image file.');
                        break;
                    }
                }
            }

            arrayUncroppedImages.sort((a, b) => a.size - b.size)

            nextImage();
        };
    } else {
        inputImage.disabled = true;
        inputImage.parentNode.className += ' disabled';
    }

    function nextImage() {
        console.log(arrayCroppedImages)
        if (arrayUncroppedImages.length > 0) {
            var file = arrayUncroppedImages.pop();
        
            fileName = file.name;
            image.src = uploadedImageURL = URL.createObjectURL(file);
            console.log(uploadedImageURL)
            cropper.destroy();
            console.log(options);
            cropper = new Cropper(image, options);
        }
        else {
            //download.href = arrayCroppedImages[0];
            download();            
        }
    }
    function download() {
        let zip = new JSZip();
        let file;

        for (file of arrayCroppedImages) { 
            console.log(file.name)
            zip.file(file.name, file.file)
        }


        zip.generateAsync({type: "blob"}).then(function(content) {
            saveAs(content, "download.zip");
        });
    }
};

