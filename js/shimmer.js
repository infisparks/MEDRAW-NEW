document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("img").forEach(function (img) {
    const wrapper = document.createElement("div");
    wrapper.className = "img-placeholder";
    wrapper.style.width = img.width + "px";
    wrapper.style.height = img.height + "px";
    img.classList.add("loading");

    // Insert wrapper before the image
    img.parentNode.insertBefore(wrapper, img);

    img.addEventListener("load", function () {
      wrapper.remove();
      img.classList.remove("loading");
      img.style.visibility = "visible";
    });

    // In case image is cached
    if (img.complete) {
      img.dispatchEvent(new Event("load"));
    }
  });
});

