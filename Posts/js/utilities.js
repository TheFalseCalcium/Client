class utilities {


    static initTextTruncate(element,originText) {
        let dom = $(element).find('.post-text')[0];
        //console.log($($(element).find('.post-text')[0]).find('div')[1]);
        let textDom = $($(element).find('.post-text')[0]).find('div')[0];
        $(dom).off();
        $(textDom).off();
        
 

        let truncateOrNot = this.truncateText(dom, textDom, originText);
        if (truncateOrNot) {
            let moreText = $($(element).find('.post-text')[0]).find('div')[1];
            $(moreText).off();
            textDom.innerText = originText;
            this.truncateText(dom, textDom, originText);

            let isEllipsis = $(moreText).hasClass('fa-angles-down');
            moreText.addEventListener("click", () => {
                if (isEllipsis) {
                    textDom.innerText = originText;
                    dom.style.height='auto';
                    //console.log(moreText);
                    $(moreText).removeClass('fa-angles-down');
                    $(moreText).addClass('fa-angles-up');
                } else {
                    dom.style.height='8em';
                    $(moreText).addClass('fa-angles-down');
                    $(moreText).removeClass('fa-angles-up');
                    this.truncateText(dom, textDom, originText);
                }
                // reset the flag;
                isEllipsis = !isEllipsis;
            });
        }
    }

    static convertToFrenchDate(numeric_date) {
        let date = new Date(numeric_date);
        var options = { year: 'numeric', month: 'long', day: 'numeric' };
        var opt_weekday = { weekday: 'long' };
        var weekday = toTitleCase(date.toLocaleDateString("fr-FR", opt_weekday));

        function toTitleCase(str) {
            return str.replace(
                /\w\S*/g,
                function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            );
        }
        return weekday + " le " + date.toLocaleDateString("fr-FR", options) + " @ " + date.toLocaleTimeString("fr-FR");
    }



    // Not my code, modified some parts to adapt it to my needs though
    // link: https://medium.com/@bitbug/better-text-ellipsis-with-javascript-1ee4e6caa895

    static truncateText(container, textDom, originText) {
        let icon_offset=22;
        const maxHeight = container.offsetHeight-icon_offset;
        //console.log(maxHeight);
        let currentText = "";
        let left = 0;
        //console.log(originText.length);
        let right = originText.length;

        //check if too small
        
            while (left < right) {
                const middle = Math.floor((left + right) / 2);
                if (left === middle) {
                    break;
                }
                const temp = originText.slice(left, middle);
                textDom.innerText = currentText + temp;
                //console.log(textDom.innerText);
                //console.log(textDom.innerText);
                const { height } = textDom.getBoundingClientRect();
                //console.log(height);
                if (height > maxHeight) {
                    right = middle;
                } else {
                    currentText += temp;
                    left = middle;
                }
            }
            textDom.innerText = currentText;
            //const { height } = container.getBoundingClientRect();
            //console.log(height);
        if (textDom.offsetHeight < maxHeight-icon_offset) {
            if($(container).find('.more')[0]!= undefined){
                $(container).find('.more')[0].remove();
            }
            return false;
            
        } else {
            return true;
        }

    }
}