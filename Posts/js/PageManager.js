class PageManager{
    constructor(scrollPanelId, content, itemLayout, getItemsCallBack) {
        this.scrollPanel = $(`#${scrollPanelId}`);
        //console.log(this.scrollPanel);
        this.content=$(`#${content}`);
        //this.itemsPanel = $(`#${itemsPanelId}`);
        this.itemLayout = itemLayout;
        this.currentPage = { limit: -1, offset: -1 };
        this.resizeTimer = null;
        this.resizeEndTriggerDelai = 300;
        this.getItems = getItemsCallBack;
        this.installViewportReziseEvent();
        this.setCurrentPageLimit();
        this.reset();
        
    }
    reset() {
        this.resetScrollPosition();
        this.update(false);
    }
    installViewportReziseEvent() {
        let instance = this;
        $(window).on('resize', function (e) {
            clearTimeout(instance.resizeTimer);
            instance.resizeTimer = setTimeout(() => {instance.update(false);}, instance.resizeEndTriggerDelai);
        });
    }
    async setCurrentPageLimit() {
        // let nbColumns = Math.trunc(this.scrollPanel.innerWidth() / this.itemLayout.width);
        // console.log(nbColumns);
        let nbRows = Math.round($('#content').innerHeight() / this.itemLayout.height);
        //console.log(this.itemLayout.height);
        this.currentPage.limit = nbRows+1; /* make sure to always have a content overflow */;
        console.log("limit: "+this.currentPage.limit);
    }
    async update(append = true) {
        console.log(this.scrollPosition());
        this.storeScrollPosition();
        
        if (!append){
            this.scrollPanel.empty();
        } 
        let endOfData = await this.getItems(this.currentPageToQueryString(append));
        this.restoreScrollPosition();
        let instance = this;
        
        this.content.scroll(function () {
            //console.log(instance.scrollPanel.outerHeight()-(instance.content.scrollTop() + instance.content.outerHeight()));
            if (!endOfData && instance.scrollPanel.outerHeight() < instance.content.scrollTop() + instance.content.outerHeight() ) {
                instance.scrollPanel.off();
                instance.currentPage.offset++;
                instance.update(true);
            }
        });
    }
    storeScrollPosition(removeEvent=true) {
        if(removeEvent){ this.content.off();}
        this.previousScrollPosition = this.scrollPosition();
    }
    scrollPosition() {
        //console.log(this.content.scrollTop());
        return this.content.scrollTop();
    }
    resetScrollPosition() {
        this.currentPage.offset = 0;
        this.content.off();
        this.content.scrollTop(0);
        console.log(this.scrollPosition());
    }
    restoreScrollPosition(removeEvent=true) {

        if(removeEvent){this.content.off();}
        this.content.scrollTop(this.previousScrollPosition);
        //console.log(this.content.scrollTop());
    }
    currentPageToQueryString(append = false) {
        this.setCurrentPageLimit();
        let limit = this.currentPage.limit;
        let offset = this.currentPage.offset;
        if (!append) {
            limit = limit * (offset + 1);
            offset = 0;
        }
        return `?limit=${limit}&offset=${offset}`;
    }
}