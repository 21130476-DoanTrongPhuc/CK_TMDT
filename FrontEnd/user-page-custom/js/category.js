document.addEventListener(
    "DOMContentLoaded",
    loadMegaMenu
);

// ======================
// LOAD MENU
// ======================

async function loadMegaMenu() {

    try {

        const response =
            await fetch(
                "http://localhost:8081/api/v1/categories/roots"
            );

        console.log(response);

        if (!response.ok) {

            throw new Error(
                "Cannot load categories"
            );
        }

        const rootCategories =
            await response.json();

        const categoriesWithChildren =
            await Promise.all(

                rootCategories.map(
                    async category => {

                        const childResponse =
                            await fetch(
                                `http://localhost:8081/api/v1/categories/${category.id}/children`
                            );

                        let children = [];

                        if (
                            childResponse.ok
                        ) {

                            children =
                                await childResponse.json();
                        }

                        return {
                            ...category,
                            children
                        };
                    }
                )
            );

        renderMegaMenu(
            categoriesWithChildren
        );

    } catch (error) {

        console.error(error);
    }
}

// ======================
// RENDER MENU
// ======================

function renderMegaMenu(
    categories
) {

    const container =
        document.getElementById(
            "mega-menu-container"
        );

    let html = "";

    for (
        let i = 0;
        i < categories.length;
        i += 3
    ) {

        html += `
            <div class="d-flex flex-wrap flex-md-nowrap">
        `;

        const row =
            categories.slice(
                i,
                i + 3
            );

        row.forEach(
            category => {

                html += `
                    <div
                        class="mega-dropdown-column pt-4 px-3">

                        <div
                            class="widget widget-links">

                            <a
                                class="d-block overflow-hidden rounded-lg mb-3"
                                href="shop-grid.html?categoryId=${category.id}">

                                <img
                                    src="https://res.cloudinary.com/dq231bpbf/image/upload/v1780738610/h6v8tqqllpfdxz3edn4m.jpg"
                                    width="80"
                                    height="50"
                                    alt="${category.name}">
                            </a>

                            <h6
                                class="font-size-base mb-2">

                                <a href="shop-grid-ls.html?categoryId=${category.id}">
                                    ${category.name}
                                </a>

                            </h6>

                            <ul class="widget-list">

                                ${renderChildren(
                                    category.children
                                )}

                            </ul>

                        </div>

                    </div>
                `;
            }
        );

        html += `
            </div>
        `;
    }

    container.innerHTML =
        html;
}

// ======================
// CHILDREN
// ======================

function renderChildren(
    children
) {

    if (
        !children ||
        children.length === 0
    ) {

        return `
            <li class="widget-list-item">

                <span
                    class="widget-list-link text-muted">

                    No subcategory

                </span>

            </li>
        `;
    }

    return children
        .map(
            child => `
                <li
                    class="widget-list-item">
                <a
                    class="widget-list-link"
                    href="shop-grid-ls.html?categoryId=${child.id}">
                    ${child.name}
                </a>

                </li>
            `
        )
        .join("");
}