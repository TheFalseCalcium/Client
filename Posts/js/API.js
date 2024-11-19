const API_URL = "http://localhost:5000/api/posts";
class POST_API {
    static initHttpState() {
        this.currentHttpError = "";
        this.currentStatus = 0;
        this.error = false;
    }
    static setHttpErrorState(xhr) {
        if (xhr.responseJSON)
            this.currentHttpError = xhr.responseJSON.error_description;
        else
            this.currentHttpError = xhr.statusText == 'error' ? "Service introuvable" : xhr.statusText;
        this.currentStatus = xhr.status;
        this.error = true;
    }

    static async Create(data, create = true) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: create ? API_URL : API_URL + '/' + data.Id,
                method: create ? "POST" : "PUT",
                contentType: 'application/json',
                data: JSON.stringify(data),
                complete: (data) => {
                    resolve(data);
                },
                error: (xhr) => { POST_API.setHttpErrorState(xhr); resolve(null); }
            })
        })
    }
    static async Get(id = null) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: id ? API_URL + '/' + id : API_URL,
                method: "GET",
                contentType: 'application/json',
                complete: (data) => { resolve({data:data.responseJSON ,ETag: data.getResponseHeader('ETag')}); },
                error: (xhr) => { POST_API.setHttpErrorState(xhr); resolve(null); }
            })
        })
    }
    static async Delete(id) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: API_URL + '/' + id,
                method: "DELETE",
                contentType: 'application/json',
                complete: (data) => { POST_API.initHttpState();
                    resolve({status:true}); },
                error: (xhr) => { POST_API.setHttpErrorState(xhr); resolve(null); }
            })
        })
    }
    static async Get_Paginated(queryString) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: API_URL + queryString,
                method: "GET",
                contentType: 'application/json',
                complete: (data) => {
                    resolve({data:data.responseJSON ,ETag: data.getResponseHeader('ETag')});
                },
                error: (xhr) => { POST_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    static async Get_Categories() {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: API_URL + '?fields=Category',
                method: "GET",
                contentType: 'application/json',
                complete: (data) => { resolve({data:data.responseJSON,ETag: data.getResponseHeader('ETag')}); },
                error: (xhr) => { POST_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    static async Head() {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: API_URL,
                method: "HEAD",
                contentType: 'text/plain',
                complete: (data) => { resolve(data.getResponseHeader('ETag')); },
                error: (xhr) => { POST_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
}
