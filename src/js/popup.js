window.addEventListener("DOMContentLoaded", () => {
    const buttonOpen = document.getElementById("navigation_popup_open_button");
    const buttonClose = document.getElementById("navigation_popup_close_button");
    const popup = document.getElementById("navigation_popup");

    buttonOpen.addEventListener("click", (e) => {
        e.stopPropagation();
        popup.classList.toggle("Popup--open");
        document.body.classList.add("popupWasOpened");
        document.body.classList.toggle("popupIsOpen");
    });

    buttonClose.addEventListener("click", (e) => {
        e.stopPropagation();
        popup.classList.toggle("Popup--open");
        document.body.classList.toggle("popupIsOpen");
    });
});

export async function initNavigationPopup() {
    const query = `{
        examplesCollection {
            items {
                title
                link
                isReleased
                structureCollection(limit: 5) {
                    items {
                        label
                        category {
                            title
                            sys {
                                id
                            }
                        }
                        icon {
                            name
                            icon
                        }
                    }
                }
            }
        }
        exampleCategoriesCollection(order: order_ASC) {
            items {
                title
                sys {
                    id
                }
            }
        }
    }`;

    const response = await fetch(
        `https://graphql.contentful.com/content/v1/spaces/${process.env.CUBE_EXAMPLES_SPACE_ID}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.CUBE_EXAMPLES_CONTENT_DELIVERY_API_TOKEN}`,
            },
            body: JSON.stringify({ query }),
        }
    );

    const { data } = await response.json();

    const categories = data.exampleCategoriesCollection.items.map(({ sys, ...rest }) => ({ ...rest, id: sys.id }));

    const examplesByCategory = categories.reduce((result, { id }) => ({ ...result, [id]: [] }), {});

    data.examplesCollection.items.forEach((item) => {
        item.structureCollection.items.forEach((it) => {
            if (examplesByCategory[it.category.sys.id]) {
                // ToDo: rewrite mapping injection to example data
                const itemCopy = Object.assign({}, item, {
                    label: it.label,
                    icon: it.icon
                });

                delete itemCopy.structureCollection;

                examplesByCategory[it.category.sys.id].push(itemCopy);
            }
        });
    });


    const popupListElement = document.createElement("ul");
    popupListElement.classList.add("Popup__list");

    categories.forEach((category) => {
        const popupListItemElement = document.createElement("li");

        const popupListTitleElement = document.createElement("h2");
        popupListTitleElement.textContent = category.title;
        popupListTitleElement.classList.add("Popup__examplesListHeader");

        popupListItemElement.appendChild(popupListTitleElement);

        const exampleListElement = document.createElement("ul");

        examplesByCategory[category.id]
            .sort((a, b) => a.label.localeCompare(b.label))
            .forEach((example) => {
                const exampleListItemElement = document.createElement("li");
                exampleListItemElement.classList.add("Popup__exampleItem");

            let exampleItem;

            if (example.isReleased) {
                exampleItem = document.createElement("a");
                exampleItem.innerHTML = example.label;
                exampleItem.classList.add("Popup__exampleLink");
                exampleItem.setAttribute("href", example.link);
                exampleListItemElement.appendChild(exampleItem);
            }
            else {
                exampleItem = document.createElement("span");
                exampleItem.innerHTML = example.label;
                exampleItem.classList.add("Popup__exampleElement");
                exampleListItemElement.appendChild(exampleItem);

                const exampleLabel = document.createElement("span");
                exampleLabel.innerHTML = "soon";
                exampleLabel.classList.add("Popup__exampleLabel");
                exampleItem.appendChild(exampleLabel);
            }

            if (example.icon) {
                const exampleIcon = document.createElement("img");
                exampleIcon.classList.add("Popup__exampleIcon");
                exampleIcon.setAttribute("src", example.icon.icon);
                exampleIcon.setAttribute("alt", example.icon.icon);
                exampleItem.prepend(exampleIcon);
            }

            exampleListElement.appendChild(exampleListItemElement);
        });

        popupListItemElement.appendChild(exampleListElement);
        popupListElement.appendChild(popupListItemElement);
    });

    return popupListElement;
}
