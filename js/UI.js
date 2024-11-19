let postsList = [];
let isLoading = true;
let pageManager = false;
let resizeTimer;
let itemLayout;
let searchKeys = '';
let searchTimeout = '';
let searchCategory = '&Category=*';
let ETag = "";
const sortByDate='&sort=Creation,desc';

function renderForm(id = null) {
    pageManager.storeScrollPosition(false);
    init_form();
    let post = id != null ? postsList[id] : createEmptyPost();
    $('#content').append(`<form  id="form-post" class="form-meetup">
    
        <input type="file" accept="image/*" style="display:none;"  id="inputImage" >
                <div class="form-header">
                    Création d'un Post
                </div>
                <br>
                <div class="form-section">
                    <div class="flex-row">
                        <label for="Title">Nom</label>
                        <input type="text" id="Title" name="Title" value="${post.Title}" required maxlength="75">
                        <i class="feedback is-wrong"></i>
                    </div>

                    <div class="flex-row">
                        <label for="Text">Texte</label>
                        <textarea id="Text" name="Text" minlength="200" required>${post.Text}</textarea>
                        <i class="feedback is-wrong"></i>
                    </div>
                    <div class="flex-row">
                        <label for="Category">Catégorie</label>
                        <input type="text" id="Category" name="Category" value="${post.Category}" required required maxlength="25">
                        <i class="feedback is-wrong"></i>
                    </div>
                </div>
                <br>
                <div class="form-title">Image</div>
                <div class="fileUploader pointer drop" id="dragArea">
                    <img class="img-preview" style="display:none;" src="${post.Image}" >
                    <div class="fileUploader-content drop" style="margin-top:.5em;">
                        <i class="fa-regular fa-image drop"></i>
                    </div>
                    <div class="fileUploader-content drop" style="text-align:center; margin-bottom:.5em;">Glisser ou déposer <br>
                        votre image</div>
                </div>
                <i class="feedback is-wrong" id="imageFeedback"></i>
                <input id="Image" name="Image" style="display:none;">

                <div class="flex-col spaced btn-container gap-big" >
                    <button class="btn-form">Enregistrer</button>
                    <button class="btn-form" type="button"> Retour</button>
                </div>
            </form>`);
            $('#content').scrollTop(0);
            console.log(post.Title != '');

    initImageControl();
    $($('form').find('button')[1]).on('click', function () {
        $('#form-post').remove();
        init_index();
        scrollTo();
        console.log($("#scroll-panel").children());
        let i=0;
        $("#scroll-panel").children().each(function(){           
            utilities.initTextTruncate($(this),postsList[i].Text);
            i++;
        });
        //pageManager.update(false);
    });
    $('#form-post').on('submit', async function (e) {
        e.preventDefault();

        if ($('.img-preview').attr('src') != "") {
            let errors=false;
            let date = new Date();

           
            if(post.Title != ''){
                date= new Date(post.Creation);
            }
           
            var now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
            date.getUTCDate(), date.getUTCHours(),
            date.getUTCMinutes(), date.getUTCSeconds());

            $(this).append($('<input id="Creation" name="Creation">').val(now_utc));

            //$('#Image').val($('.img-preview').attr('src'));
            let data = $('form').serializeArray();
            let json = {};
            data.forEach(element => {
                json[element.name] = element.value
            });

            if (id != null) {
                json['Id'] = postsList[id].Id;
            }

            $('#form-post').css('visibility', 'hidden');
            loading("content", true);
            
            let res = await POST_API.Create(json, id == null);
            if (res == null) {
                removeLoading();
                renderError();
            } else {
                removeLoading();
                init_index();
                scrollTo();
                checkDataState();
            }
        } else {
            $('#imageFeedback').text("Choisissez une image");
            $('.fileUploader').removeClass('active');
        }
    });
}
function scrollTo() {
    pageManager.restoreScrollPosition(false);
}
function renderError() {
    init_index();
    $('.search-bar-container').hide();
    $('#scroll-panel').hide();
    let html = `
        <div id="error"> 
            <div class="form-header" style="color:var(--red);">Erreur ${POST_API.currentStatus}</div>
            <br>
            <div class="font">${POST_API.currentHttpError}</div>
        </div>
    `;
    $('#content').append(html);
}
async function renderFormDelete(post) {
    pageManager.storeScrollPosition(false);
    init_form();
    let html = `<form  id="form-post" class="form-meetup">
                <div class="form-header">
                    Effacer cette nouvelle ?
                </div>
                <br>
                <div class="post-container flex-row gap-sm" style="width:unset;" >
                    <div class="post-head flex-col space">
                        <div class="font">${post.Category}</div>
                    </div>
                <div class="post-header font">${post.Title}</div>
                <div class="post-banner">
                    <img src="${post.Image}">
                </div>
                <div class="post-text">
                    <div class="font">${post.Text}</div>
                    <div class="fa-solid fa-angles-down pointer more"></div>
                </div>
                </div>

        <div class="flex-col spaced btn-container gap-big" >
                    <button class="btn-form " id="delete" style="background-color:var(--red);">Effacer</button>
                    <button class="btn-form"> Annuler</button>
                </div>
            </form>`;
    $('#content').append(html);

    utilities.initTextTruncate($($("#form-post").find('.post-container')[0]), post.Text);
    let formDeleteResizeTimer;
    function resizeText() {
        clearTimeout(formDeleteResizeTimer);
        formDeleteResizeTimer = setTimeout(() => {
            utilities.initTextTruncate($($("#form-post").find('.post-container')[0]), post.Text);
        }, 300);
    }
    $('#content').scrollTop(0);
    $(window).on('resize', resizeText);

    $('#form-post').on('submit', function (e) {
        e.preventDefault();
    });

    $($("#form-post").find("#delete")[0]).on('click', async function () {
        $('#form-post').css('visibility', 'hidden');
        loading("content", true);
        let res = await POST_API.Delete(post.Id);
        console.log(res);
        if (POST_API.currentStatus != 0) {
            removeLoading();
            renderError();
        } else {
            removeLoading();
            $(window).off('resize', resizeText);
            init_index();
            scrollTo();
            checkDataState();
        }
    });

    $($("#form-post").find('button')[1]).on('click', function () {
        $(window).off('resize', resizeText);
        $('#form-post').remove();
        init_index();
        scrollTo();
        pageManager.update(false);
    });
}
async function init_UI() {
    $('#content').off();
    $('#options').show();
    $('#plus').show();
    $('#close').hide();
    $('#form-post').remove();
    $('.search-bar-container').show();

    $('#scroll-panel').show();
    loading('scroll-panel');

    let res = await POST_API.Get_Paginated('?limit=1&offset=0');
    let data=res.data;
    console.log(data);

    if (data != null && data != undefined) {

        let html = $(`<div class="post-container flex-row gap-sm" style="visibility:hidden;" >
            <div class="post-head flex-col space">
                <div class="font">${data[0].Category}</div>
                <div><i class="fa fa-pencil-square pointer icon-sm hover-icon"></i> <i class="fa fa-window-close pointer icon-sm hover-icon"></i></div>
            </div>
            <div class="post-header font">${data[0].Title}</div>
            <div class="post-banner">
                <img src="${data[0].Image}">
                <div class="font">blablLBALABLN</div>
            </div>
            <div class="post-text">
            <div class="font">${data[0].Text}</div>
           <div class="fa-solid fa-angles-down pointer more"></div>
            </div>
            </div>`);
        $('#scroll-panel').append(html);
        postsList[0] = data[0];
    }

    itemLayout = {
        width: $($('#scroll-panel').find('.post-container')[0]).outerWidth(),
        height: $($('#scroll-panel').find('.post-container')[0]).outerHeight()
    }

    pageManager = new PageManager('scroll-panel', 'content', itemLayout, getPosts);
    removeLoading();
    $('#close').on('click', function () {
        init_index();
        scrollTo();
        pageManager.update(false);
    });
    $('#plus').on('click', function () {
        init_index();
        renderForm();
    });
    $('#news').on('click', function () {
        searchTimeout = '';
        searchCategory = '&Category=*';
        init_index();
        $('.search-bar').val('');
        searchKeys = '';
        pageManager.reset();
    });
    $('#options').on('click', function () {
        $('#drop-down').toggle();
    });
    $($('#drop-down').children()[0]).on('click', function () {
        searchCategory = '&Category=' + $(this).attr('value');
        pageManager.reset();
        $('#drop-down').toggle();
    });
    async function checkETag() {
        const time= new Date().getTime();
        await checkDataState();
        setTimeout(checkETag,10000 - (new Date().getTime()-time));
    }
    checkETag();
}
function init_index() {
    $('#options').show();
    $('#plus').show();
    $('#close').hide();
    $('#form-post').remove();
    $('.search-bar-container').show();
    $('#scroll-panel').show();
    $('#error').remove();
}
function init_form() {
    $('#scroll-panel').hide();
    $('#plus').hide();
    $('#close').show();
    $('.search-bar-container').hide();
    $('#drop-down').hide();
    $('#error').remove();
}
async function getPosts(queryString) {
    loading('scroll-panel');
    let getOffset = queryString.split('=')[2];
    if (getOffset == '0' && (searchKeys == ',' || searchKeys == '') && searchCategory.slice(10) == '*') {
        postsList = [];
    }
    

    id = postsList.length == 0 ? 0 : postsList.length;
    let res= await POST_API.Get_Paginated(queryString + searchKeys + searchCategory+sortByDate);
    // pas de cul de sac
    if(getOffset == 0 && res != null && res.data.length <1){
        searchCategory='&Category=*';
        res= await POST_API.Get_Paginated(queryString + searchKeys + searchCategory+sortByDate);
    }
  
    if (res == null) {
        removeLoading();
        $('#content').off();
        $('#scroll-panel').empty();
        renderError();
        return true;
    } else {
        let posts=res.data;
        let _ETag=res.Etag;
        checkDataState(_ETag);
        let found;

        posts.forEach(function (element) {
            found = false;
            postsList.every(function (element2, index) {
                if (element2.Id == element.Id) {
                    postsList[index] = element;
                    found = true;
                    return false;
                }
                return true;
            });
            if (found == false) {
                postsList.push(element);
            }
        });
        posts.forEach(element => {
            renderPost(element, postsList.indexOf(element));
        });
        //console.log(postsList.length);
        fillCategory();
        removeLoading();
        return posts.length < 1;
    }
}
function search(text) {
    let words = text.trim().split(' ');
    let queryString = '&keywords=';
    words.forEach(word => {
        queryString += word + ',';
    });
    searchKeys = queryString;
    pageManager.update(false);
}
function renderPost(post, id) {
    let date = utilities.convertToFrenchDate(post.Creation);
    let html = $(`<div class="post-container flex-row gap-sm" >
                <div class="post-head flex-col space">
                    <div class="font">${post.Category}</div>
                    <div><i class="fa fa-pencil-square pointer icon-sm hover-icon"></i> <i class="fa fa-window-close pointer icon-sm hover-icon"></i></div>
                </div>
                <div class="post-header font">${post.Title}</div>
                <div class="post-banner">
                    <img src="${post.Image}">
                    <div class="font">${date}</div>
                </div>
                <div class="post-text">
                <div class="font">${post.Text}</div>
               <div class="fa-solid fa-angles-down pointer more"></div>
                </div>
        </div>`);
    $('#scroll-panel').append(html);
    $(html).find('.fa-pencil-square').on('click', function () {
        //console.log(id);
        renderForm(id);
    });
    $(html).find('.fa-window-close').on('click', function () {
        renderFormDelete(postsList[id]);
    });
    //console.log($(html));
    utilities.initTextTruncate($(html), post.Text);
}

$(document).ready(function () {
    init_UI();
    $('.search-bar').on('keyup', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            search($(this).val());
        }, 500);
    });

});

function createEmptyPost() {
    let post = {};
    post.Title = '';
    post.Text = '';
    post.Category = '';
    post.Image = '';
    return post;
}
function loading(elem_id, top = false) {
    html = '<div id="loading"><svg class="spinner" viewBox="0 0 50 50" id="svgLoading">' +
        '<circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>'
        + '</svg></div>';
    if (!top) {
        $('#' + elem_id).append(html);
    } else {
        $('#' + elem_id).prepend(html);
    }

}
function removeLoading() {
    $('#loading').remove();
}
async function fillCategory() {
    let res = await POST_API.Get_Categories();
    if(res != null){
        let cat =res.data;
        let _Etag=res.Etag;
        let categories = [];
        let found;
        cat.forEach(function (element) {
            found = false;
            categories.every(function (element2) {
                if (element2.normalize().toLowerCase() == element.Category.normalize().toLowerCase()) {
                    found = true;
                    return false;
                }
                return true;
            });
            if (found == false) {
                categories.push(element.Category);
            }
        });
        let drop = $($('#drop-down').find('.drop-content')[0]);
    
        drop.children().remove();
    
        categories.forEach((category) => {
            if (searchCategory.slice(10).normalize().toLowerCase() == category.normalize().toLowerCase()) {
                html = $(`<div class="pointer darker" value="${category}">${category}</div>`);
            } else {
                html = $(`<div class="pointer" value="${category}">${category}</div>`);
            }
    
            drop.append(html);
            html.on('click', function () {
                searchCategory = '&Category=' + $(this).attr('value');
                pageManager.reset();
                $('#drop-down').hide();
            });
        });
    
        if (searchCategory.slice(10) == '*') {
            $($('#drop-down').children()[0]).addClass('darker');
        } else {
            $($('#drop-down').children()[0]).removeClass('darker');
        }
    }else{
        renderError();
    }
    //console.log(postsList);
    
}

async function checkDataState(etag = undefined) {
    if (etag == undefined) {
        let state = await POST_API.Head();

        if (ETag != state) {

            if (ETag != "") {
                pageManager.update(false);
            }
            ETag = state;
        }
    } else {
        if(ETag == "" ){
            let state = await POST_API.Head();
            ETag=state;
        }else{
            if(ETag != etag){
                pageManager.update(false);
            }
            ETag=etag;
        }
        
    }
}
