const commentsWrapper = document.querySelector("ul.main-comments");
const wrapper = document.querySelector(".wrapper");
const popup = document.querySelector(".popup");

/**
 * Check The Data On Local Storage And Fetch It if Not Existed
 *  
*/

// localStorage.clear()
    
if (!localStorage.getItem("data")) {
    fetch("data.json")
    .then((data) => {
        return data.json();
    })
    .then((data) => {
        localStorage.setItem("data", JSON.stringify(data));
        initializePage(data);
    });
} else {

    initializePage(JSON.parse(localStorage.getItem("data")));
}



function initializePage(data) {
    
    // Creating Comments & its Replies
    distributingComments(data);
    
    // Determine If Clicking On Reply Btn is For Comment Or Reply
    const replyBtns = document.querySelectorAll("a.reply");
    replyBtnsDetermination(replyBtns);
    
    // Submiting Comment Forms
    const commentForm = document.querySelector(".add-comment-form");
    submitComment(commentForm, data);
    
    // Submiting Reply Forms
    const replyForms = document.querySelectorAll(".reply-form");
    submitReply(replyForms, data);
    
    // Determine if The reply Buttons clicked for reply to reply
    const replyBtnsOfReplies = document.querySelectorAll(".reply-to-reply")
    replyToReply(replyBtnsOfReplies);
    
    // Deleting Comments
    
    // const deleteBtns = document.querySelectorAll(".delete-comment");
    deleteAndEditComment(data);
    
    // Increasing Comment Score
    increaseCommentScore(data);
    
    // Decreasing Comment Score
    decreaseCommentScore(data);

    // Delete And Edit Replies
    deleteAndEditReply(data);

    // Increase Reply Score
    increaseRePlyScore(data);
}



// Creating The Comments By the Using Of Functions CreateExistedComment & createExistedReply

function distributingComments(data){
    data.comments.forEach((comment) => {

        var item = createExistedComment(comment, data);
        
        if (comment.replies.length > 0) {

            let commentChildsList = document.createElement("ul");

            comment.replies.forEach((reply) => {

                var replyElement = createExistedReply(reply, comment.id, data.currentUser);
                commentChildsList.classList.add("comment-childs");
                commentChildsList.appendChild(replyElement);
            });

            item.appendChild(commentChildsList);
        }

        if (comment.user.username === data.currentUser.username) {
            item.classList.add("current-user");
        }
        commentsWrapper.appendChild(item);
    });
}   



// Reply On Comments
function replyBtnsDetermination(buttons){
    buttons.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            let liOfComment = btn.closest("li");
            scrollToReplyElement (liOfComment);
            let formOfComment = document.querySelector(`#formOfComment_${liOfComment.dataset.id} form`);
            if (formOfComment.hasAttribute("data-reply-author")) {
                formOfComment.removeAttribute("data-reply-author");
            }
            if (!formOfComment.hasAttribute("data-comment-author")){
                formOfComment.setAttribute("data-comment-author", btn.dataset.commentAuthor);
            }
        });
    });
    
}

// Adding Comment

function submitComment(commentForm, data){
    
    commentForm.addEventListener("submit", function (e) {
        e.preventDefault();
        let input = commentForm.querySelector("textarea");
        if (commentForm.getAttribute("state") === "comment"){

            if (input.value !== ""){
                
                let newComment = {
                    "id": data.comments.length + 1,
                    "content": input.value,
                    "createdAt": "today",
                    "score": 0,
                    "user": {
                        "image": { 
                            "png": "images/avatars/image-juliusomo.png",
                            "webp": "images/avatars/image-juliusomo.webp"
                        },
                        "username": `${data.currentUser.username}`
                    },
                    "replies": []
                }
                var item = createExistedComment(newComment, data);
                item.classList.add("current-user");
                commentsWrapper.appendChild(item);
        
                data.comments.push(newComment);
            }
        }else if (commentForm.getAttribute("state") === "edit") {
            document.querySelector(`[data-id="${commentForm.dataset.commentIndex}"]`).querySelector("p.comment-content strong").nextSibling.textContent = input.value;
            data.comments.map((com, index) => {
                com.content = index === commentForm.dataset.commentIndex - 1 ? input.value : com.content;  
                return;
            });

            commentForm.setAttribute("state", "comment");
            document.querySelector(".force-edit").classList.remove("force-edit");
        }
        
        input.value = "";
        localStorage.setItem("data", JSON.stringify(data));
    
    });
    
}


function submitReply(replyForms, data){
    replyForms.forEach((form) => {
        form.addEventListener("submit", function (e) {
            e.preventDefault();            
            let input = form.querySelector("textarea");
            let comment = data.comments[form.dataset.commentIndex - 1];
            
            if (form.getAttribute("state") === "reply"){
                if (input.value !== ""){
                    
                    let newReply = {
                        "id": comment.replies.length + 1,
                        "content": input.value,
                        "createdAt": "today",
                        "score": 0,
                        "replyingTo": form.dataset.commentAuthor ? form.dataset.commentAuthor : form.dataset.replyAuthor,
                        "user": {
                            "image": { 
                                "png": "images/avatars/image-juliusomo.png",
                                "webp": "images/avatars/image-juliusomo.webp"
                            },
                            "username": `${data.currentUser.username}`
                        },
                    }
        
                    
                    var item = createExistedReply(newReply, comment.id, data.currentUser);
                    item.classList.add("current-user");
                    
                    if (comment.replies.length > 0) {
                        form.parentElement.parentElement.querySelector(".comment-childs").appendChild(item);
                    }else{
                        let commentChildsList = document.createElement("ul");
                        commentChildsList.classList.add("comment-childs");
                        commentChildsList.appendChild(item);
                        form.parentElement.parentElement.appendChild(commentChildsList);
                    }
        
                    data.comments.map((com, index) => {
        
                        if (index === form.dataset.commentIndex - 1){
                            
                            com.replies.push(newReply);
                            
                        }
                        
                    });
                }
            }else if (form.getAttribute("state") === "edit"){
                let reply = document.querySelector(`li[data-reply-id="${form.dataset.replyIndex}"]`);
                reply.querySelector("p.comment-content strong").nextSibling.textContent = " " + input.value;
                data.comments[+form.dataset.commentIndex - 1].replies[+form.dataset.replyIndex - 1].content = input.value;
                
                form.setAttribute("state", "reply");
                form.removeAttribute("data-reply-author");
                form.setAttribute("data-comment-author", comment.user.username);
                document.querySelector(".force-edit").classList.remove("force-edit");

            }
            input.value = "";
            localStorage.setItem("data", JSON.stringify(data));
        });
    });
    
}


/**
 * Reply To Reply
 */

function replyToReply(replyBtnsOfReplies){
    replyBtnsOfReplies.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            let liOfComment = document.querySelector(`[data-id="${btn.dataset.commentIndex}"]`);
            scrollToReplyElement(liOfComment);

            let formOfComment = document.querySelector(`#formOfComment_${liOfComment.dataset.id} form`);
            if (formOfComment.hasAttribute("data-comment-author")) {
                formOfComment.removeAttribute("data-comment-author");
            }
            if (!formOfComment.hasAttribute("data-reply-author")){
                formOfComment.setAttribute("data-reply-author", btn.dataset.replyAuthor);
            }
            formOfComment.setAttribute("state", "reply");
        });
    });
}


/**
 * Delete & Editing Comments
 */

function deleteAndEditComment(data){
    
    commentsWrapper.addEventListener("click", function (e) {
        const clickedElement = e.target;
        if (clickedElement.closest("a") && clickedElement.closest("a").classList.contains("delete-comment")){
            e.preventDefault();
            let comment = document.querySelector(`[data-id="${clickedElement.closest("a").parentElement.dataset.commentIndex}"]`);
            confirmDelete(comment, data);
        }
        
        if (clickedElement.closest("a") && clickedElement.closest("a").classList.contains("edit-comment")){
            e.preventDefault();
            
            document.querySelectorAll(".force-edit").forEach((btn) => {
                btn.classList.remove("force-edit");
            });

            clickedElement.closest("a").classList.toggle("force-edit");
            let comment = document.querySelector(`[data-id="${clickedElement.closest("a").parentElement.dataset.commentIndex}"]`);
            let commentForm = document.querySelector(".add-comment-form");
            let text = comment.querySelector("p.comment-content").textContent.trim().split(" ").slice(1).join(" ");
            
            if (clickedElement.closest("a").classList.contains("force-edit")){
                commentForm.setAttribute("state", "edit");
                commentForm.setAttribute("data-comment-index", clickedElement.closest("a").parentElement.dataset.commentIndex);
                commentForm.querySelector("textarea").focus();
                commentForm.querySelector("textarea").value = text;
            }else {
                commentForm.setAttribute("state", "reply");
                commentForm.querySelector("textarea").focus();
                commentForm.querySelector("textarea").value = "";
                commentForm.removeAttribute("data-comment-index");
            }

        }

    });
}

/*
 * Confirm Delete Function
*/
function confirmDelete(comment, data){

    popup.classList.add("show");
    popup.addEventListener("click", function (e) {
        e.preventDefault();
        if (e.target.classList.contains("confirm-delete")){
            data.comments = data.comments.filter((item) => {
                return item.id !== Number(comment.dataset.id);
            });
            
            data.comments.map((item) => {
                return item.id > +comment.dataset.id ? item.id-- : item.id;
            });
            
            comment.remove();
            localStorage.setItem("data", JSON.stringify(data));
            popup.classList.remove("show");
        }else if (e.target.classList.contains("cancel")){
            popup.classList.remove("show");
        }
    });
}

/**
 * End Reply To Reply
 */


// Delete And Edit Replies

function deleteAndEditReply(data) {

    commentsWrapper.addEventListener("click", function (e) {
        
        let clickedElement = e.target;
        
        if (clickedElement.closest("a") && clickedElement.closest("a").classList.contains("edit-reply")){
            e.preventDefault();
            const liOfComment = clickedElement.closest("a").closest("ul").closest("li");
            const liOfReply = clickedElement.closest("a").closest("li");

            let formOfComment = liOfComment.querySelector("form");

            if (clickedElement.closest("a").classList.contains("force-edit")){
                
                clickedElement.closest("a").classList.remove("force-edit");
                
                formOfComment.setAttribute("state", "reply");
                formOfComment.removeAttribute("data-reply-index");
                formOfComment.querySelector("textarea").focus();
                formOfComment.querySelector("textarea").value = "";
                formOfComment.setAttribute("data-comment-author", data.comments[+liOfComment.dataset.id - 1].user.username);
                
                if (formOfComment.hasAttribute("data-reply-author")){
                    formOfComment.removeAttribute("data-reply-author");
                }

            }else {
                document.querySelectorAll(".force-edit").forEach((btn) => {
                    btn.classList.remove("force-edit");
                });
                
                clickedElement.closest("a").classList.add("force-edit");
                scrollToReplyElement(liOfComment);
                
                if(!liOfComment.classList.contains("reply-status")){
                    liOfComment.classList.add("reply-status");
                }
                
                formOfComment.setAttribute("state", "edit");
                formOfComment.setAttribute("data-reply-index", liOfReply.dataset.replyId);
                formOfComment.querySelector("textarea").focus();
                formOfComment.querySelector("textarea").value = liOfReply.querySelector("p.comment-content strong").nextSibling.textContent.trim();
                formOfComment.setAttribute("data-reply-author", data.currentUser.username);
                
                if (formOfComment.hasAttribute("data-comment-author")){
                    formOfComment.removeAttribute("data-comment-author");
                }
            }
        }
        if(clickedElement.closest("a") && clickedElement.closest("a").classList.contains("delete-reply")){
            e.preventDefault();
            const liOfComment = clickedElement.closest("a").closest("ul").closest("li");
            const liOfReply = clickedElement.closest("a").closest("li");
            confirmReplyDelete(liOfComment, liOfReply, data);
        }
    });
}

function confirmReplyDelete(comment, reply, data){

    let popup = document.querySelector(".popup");
    popup.classList.add("show");

    popup.addEventListener("click", function (e) {
        
        if (e.target.classList.contains("confirm-delete")){
            e.preventDefault();

            data.comments[+comment.dataset.id - 1].replies = data.comments[+comment.dataset.id - 1].replies.filter((item) => {
                return item.id !== +reply.dataset.replyId;
            });

            data.comments[+comment.dataset.id - 1].replies.map((item) => {
                item.id = item.id > +reply.dataset.replyId ? item.id - 1 : item.id;
                return;
            });

            reply.remove();
            
            let itemsList = Array.from(comment.querySelectorAll("ul.comment-childs li")).map((item) => {
                item.dataset.replyId = +item.dataset.replyId > +reply.dataset.replyId ? `${+item.dataset.replyId - 1}` : item.dataset.replyId;
                return;
            });

            popup.classList.remove("show");
            localStorage.setItem("data", JSON.stringify(data));
        }else if (e.target.classList.contains("cancel")){
            e.preventDefault();
            popup.classList.remove("show");
        }
    });
}

/**
 * Increase The Score Of Comment
 */


function increaseCommentScore(data){
    commentsWrapper.addEventListener("click", function (e) {
        const clickedelement = e.target;
        if(clickedelement.closest("a") && clickedelement.closest("a").classList.contains("plus")){
            e.preventDefault();
            let newScore = +clickedelement.closest("a").nextElementSibling.textContent + 1;
            data.comments[+clickedelement.closest("a").parentElement.dataset.commentIndex - 1].score += 1;
            clickedelement.closest("a").nextElementSibling.textContent = newScore;
            localStorage.setItem("data", JSON.stringify(data));
        }
        
    });
}


/**
 * Decrease The Comment Score
 */

function decreaseCommentScore(data){
    commentsWrapper.addEventListener("click", function (e) {
        let clickedelement = e.target;
        if (clickedelement.closest("a") && clickedelement.closest("a").classList.contains("minus")) {
            e.preventDefault();
            let newScore = +clickedelement.closest("a").previousElementSibling.textContent - 1;
            data.comments[+clickedelement.closest("a").parentElement.dataset.commentIndex - 1].score -= 1;
            clickedelement.closest("a").previousElementSibling.textContent = newScore;
            localStorage.setItem("data", JSON.stringify(data));
        }
    });
}

/**
 * End Decrease Comment Score
 */

/**
 * Increase Reply Score
 */

function increaseRePlyScore(data) {
    commentsWrapper.addEventListener("click", function (e) {
        let clickedElement = e.target;

        if (clickedElement.closest("a") && clickedElement.closest("a").classList.contains("reply-plus")){
            e.preventDefault();

            let newScore = +clickedElement.closest("a").nextElementSibling.textContent + 1;
            clickedElement.closest("a").nextElementSibling.textContent = newScore;
            
            let commentIndex = +clickedElement.closest("a").closest("ul").closest("li").dataset.id - 1; 
            let replyIndex = +clickedElement.closest("a").closest("li").dataset.replyId - 1;

            data.comments[commentIndex].replies[replyIndex].score++;

            localStorage.setItem("data", JSON.stringify(data));
        }
        
        if (clickedElement.closest("a") && clickedElement.closest("a").classList.contains("reply-minus")){
            e.preventDefault();

            let newScore = +clickedElement.closest("a").previousElementSibling.textContent - 1;
            clickedElement.closest("a").previousElementSibling.textContent = newScore;
            
            let commentIndex = +clickedElement.closest("a").closest("ul").closest("li").dataset.id - 1; 
            let replyIndex = +clickedElement.closest("a").closest("li").dataset.replyId - 1;

            data.comments[commentIndex].replies[replyIndex].score--;

            localStorage.setItem("data", JSON.stringify(data));
        }
    });
}

/**
 * Function To Create Comments From Scratch
*/

function createExistedComment (comment, data) {
    
    var item = document.createElement("li");
    item.classList.add("flexcol");
    item.dataset.id = comment.id;
    
    let commentIndex = comment.id ;
    
    let itemContent = `
    <div class="content flex">
        <div class="mobile-hide">
            <div class="score flexcol" data-comment-index="${commentIndex}">
                <a href="" class="plus">
                    <img src="images/icon-plus.svg" alt="">
                </a>
                <strong>${comment.score}</strong>
                <a href="" class="minus">
                    <img src="images/icon-minus.svg" alt="">
                </a>
            </div>
        </div>

        <div class="body flexcol">
            <div class="head flex">
                <div class="userinfo flex">
                    <img src="${comment.user.image.png}" alt="">
                    <strong class="username">${comment.user.username}</strong>
                    ${comment.user.username === data.currentUser.username ? "<span class='you'>You</span>": ""}
                </div>
                <p class="createdAt">${comment.createdAt}</p>

                <div class="mobile-hide">
                    <div class="current-user-btns flex" data-comment-index=${comment.id}>
                        <a href="#" class="edit flex edit-comment">
                            <span class="icon-small"><img src="images/icon-edit.svg" alt=""></span> <strong>Edit</strong>
                        </a>
                        <a href="#" class="delete flex delete-comment">
                            <span class="icon-small"><img src="images/icon-delete.svg" alt=""></span> <strong>Delete</strong>
                        </a>
                    </div>
                    <div class="another-user">
                        <a href="#formOfComment_${comment.id}" class="reply flex">
                            <span class="icon-small"><img src="images/icon-reply.svg" alt=""></span> <strong>Reply</strong>
                        </a>
                    </div>
                </div>
            </div>

            <p class="comment-content">
                <strong class="username">@roby </strong>${comment.content}
            </p>

            <div class="desktop-hide flex-spbw">
                <div class="score flex">
                    <a href="" class="plus">
                        <img src="images/icon-plus.svg" alt="">
                    </a>
                    <strong>${comment.score}</strong>
                    <a href="#" class="minus">
                        <img src="images/icon-minus.svg" alt="">
                    </a>
                </div>
                
                <div class="current-user-btns flex" style="margin-left:auto;" data-comment-index=${comment.id}>
                    <a href="#" class="edit flex edit-comment">
                        <span class="icon-small"><img src="images/icon-edit.svg" alt=""></span> <strong>Edit</strong>
                    </a>
                    <a href="#" class="delete flex delete-comment">
                        <span class="icon-small"><img src="images/icon-delete.svg" alt=""></span> <strong>Delete</strong>
                    </a>
                </div>
                <div class="another-user">
                    <a href="#formOfComment${comment.id}" class="reply flex">
                        <span class="icon-small"><img src="images/icon-reply.svg" alt=""></span> <strong>Reply</strong>
                    </a>
                </div>

            </div>
        </div>
    </div>
    
    <div class="form content flex" id="formOfComment_${comment.id}">
        <div class="userinfo"><img src="${data.currentUser.image.png}" srcset=""></div>
        <form action="" class="flex reply-form" data-comment-index="${comment.id}" data-comment-author="${comment.user.username}" state="reply">
            <textarea name=""  ></textarea>
            <button type="submit">Reply</button>
        </form>
    </div>
    `

    item.innerHTML = itemContent;

    return item;
}
/**
 * End Of Function Create Comment
 */



/**
 * Function To create Replies To The Comments 
 */

function createExistedReply (reply, commentId, user) {
    let replyElement = document.createElement("li");
    replyElement.dataset.replyId = reply.id;
    replyElement.classList.add("flexcol", "comment-reply");
    if (reply.user.username === user.username) {
        replyElement.classList.add("current-user");
    }
    let replyContent = `
            <div class="content flex">
                <div class="mobile-hide">
                    <div class="score flexcol">
                        <a href="#" class="reply-plus">
                            <img src="images/icon-plus.svg" alt="">
                        </a>
                        <strong>${reply.score}</strong>
                        <a href="#" class="reply-minus">
                            <img src="images/icon-minus.svg" alt="">
                        </a>
                    </div>
                </div>

                <div class="body flexcol">
                    <div class="head flex">
                        <div class="userinfo flex">
                            <img src="${reply.user.image.png}" alt="">
                            <strong class="username">${reply.user.username}</strong>
                            <span class='you'>You</span>
                        </div>
                        <p class="createdAt">${reply.createdAt}</p>

                        <div class="mobile-hide">
                            <div class="current-user-btns flex">
                                <a href="#" class="edit flex edit-reply">
                                    <span class="icon-small"><img src="images/icon-edit.svg" alt=""></span> <strong>Edit</strong>
                                </a>
                                <a href="#" class="delete flex delete-reply">
                                    <span class="icon-small"><img src="images/icon-delete.svg" alt=""></span> <strong>Delete</strong>
                                </a>
                            </div>
                            <div class="another-user">
                                <a href="" class="flex reply-to-reply" data-comment-index=${commentId} data-reply-author=${reply.user.username}>
                                    <span class="icon-small"><img src="images/icon-reply.svg" alt=""></span> <strong>Reply</strong>
                                </a>
                            </div>
                        </div>
                    </div>

                    <p class="comment-content">
                        <strong>@${reply.replyingTo}</strong> ${reply.content}
                    </p>

                    <div class="desktop-hide flex-spbw">
                        <div class="score flex">
                            <a href="#" class="reply-plus">
                                <img src="images/icon-plus.svg" alt="">
                            </a>
                            <strong>${reply.score}</strong>
                            <a href="#" class="reply-minus">
                                <img src="images/icon-minus.svg" alt="">
                            </a>
                        </div>
                        <div class="current-user-btns flex">
                            <a href="#" class="edit flex edit-reply">
                                <span class="icon-small"><img src="images/icon-edit.svg" alt=""></span> <strong>Edit</strong>
                            </a>
                            <a href="#" class="delete flex delete-reply">
                                <span class="icon-small"><img src="images/icon-delete.svg" alt=""></span> <strong>Delete</strong>
                            </a>
                        </div>
                        <div class="another-user">
                            <a href="#" class="flex reply-to-reply" data-comment-index=${commentId} data-reply-author=${reply.user.username}>
                                <span class="icon-small"><img src="images/icon-reply.svg" alt=""></span> <strong>Reply</strong>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            `
    replyElement.innerHTML = replyContent;
    return replyElement;
}


/**
 * End Of Function To create Replies To The Comments 
 */


/**
 * Function To Scroll Smoothly To the Commet Form
 */

function scrollToReplyElement(element) {
    if (!element.classList.contains("reply-status")){
        element.classList.add("reply-status");
    }
    let formOfComment = document.querySelector(`#formOfComment_${element.dataset.id}`);
    formOfComment.querySelector("textarea").focus();
    wrapper.scroll({
        top: formOfComment.offsetTop - wrapper.offsetTop,
        behavior: "smooth"
    });

}



