window.addEventListener("DOMContentLoaded", () => {
    const buttonOpen = document.getElementById("navigation_popup_open_button");
    const buttonClose = document.getElementById("navigation_popup_close_button");
    const popup = document.getElementById("navigation_popup");

    buttonOpen.addEventListener("click", (e) => {
        e.stopPropagation();
        popup.classList.add("Popup--open");
        document.body.classList.add("popupWasOpened");
        document.body.classList.add("popupIsOpen");
    });

    buttonClose.addEventListener("click", (e) => {
        e.stopPropagation();
        popup.classList.remove("Popup--open");
        document.body.classList.remove("popupWasOpened");
        document.body.classList.remove("popupIsOpen");
    });
});

function isCurrentExample(exampleLink) {
    const { location } = window;
    const link = new URL(exampleLink);

    return location.hostname === link.hostname
        && location.pathname === link.pathname
        && location.hash.replace(/^\#\//g, '') === link.hash.replace(/^\#\//g, '');
}

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

            let exampleElement;

            if (example.isReleased) {
                exampleElement = document.createElement("a");
                exampleElement.classList.add("Popup__exampleLink");
                if (isCurrentExample(example.link)) {
                    exampleElement.classList.add("Popup__exampleLink--active");
                }
                exampleElement.setAttribute("href", example.link);
                exampleElement.textContent = example.label;
                exampleListItemElement.append(exampleElement);
            } else {
                exampleElement = document.createElement("span");
                exampleElement.classList.add("Popup__exampleText");
                exampleElement.textContent = example.label;
                exampleListItemElement.append(exampleElement);

                const exampleLabel = document.createElement("span");
                exampleLabel.textContent = "soon";
                exampleLabel.classList.add("Popup__exampleSoon");
                exampleElement.append(exampleLabel);
            }

            if (example.icon) {
                const exampleIconElement = document.createElement("img");
                exampleIconElement.classList.add("Popup__exampleIcon");
                exampleIconElement.setAttribute("src", example.icon.icon);
                exampleIconElement.setAttribute("alt", example.icon.name);
                exampleElement.prepend(exampleIconElement);
            }

            exampleListElement.append(exampleListItemElement);
        });

        popupListItemElement.append(exampleListElement);
        popupListElement.append(popupListItemElement);
    });

    return popupListElement;
}
