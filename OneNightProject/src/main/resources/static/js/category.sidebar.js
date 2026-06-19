const CATEGORY_API =
    "http://localhost:8081/api/v1/categories";

document.addEventListener(
    "DOMContentLoaded",
    loadCategories
);

/**
 * ==========================
 * LOAD ROOT CATEGORIES
 * ==========================
 */
async function loadCategories() {

    try {

        const response =
            await fetch(
                `${CATEGORY_API}/roots`
            );

        if (!response.ok) {
            throw new Error(
                "Cannot load categories"
            );
        }

        const roots =
            await response.json();

        const container =
            document.getElementById(
                "shop-categories"
            );

        let html = "";

        for (const root of roots) {

            const children =
                await loadChildren(
                    root.id
                );

            html += createCategoryCard(
                root,
                children
            );
        }

        container.innerHTML = html;

    } catch (error) {

        console.error(
            "Load category error:",
            error
        );
    }
}

/**
 * ==========================
 * LOAD CHILDREN
 * ==========================
 */
async function loadChildren(parentId) {

    try {

        const response =
            await fetch(
                `${CATEGORY_API}/${parentId}/children`
            );

        if (!response.ok) {
            return [];
        }

        return await response.json();

    } catch {

        return [];
    }
}

/**
 * ==========================
 * CREATE ROOT CARD
 * ==========================
 */
function createCategoryCard(
    root,
    children
) {

    const collapseId =
        `category-${root.id}`;

    return `
        <div class="card">

            <div class="card-header">

                <h3 class="accordion-heading">

                    <a
                        class="collapsed"
                        href="#${collapseId}"
                        data-toggle="collapse">

                        ${root.name}

                        <span class="accordion-indicator"></span>

                    </a>

                </h3>

            </div>

            <div
                class="collapse"
                id="${collapseId}"
                data-parent="#shop-categories">

                <div class="card-body">

                    <ul class="widget-list">

                        <li class="widget-list-item">

                            <a
                                href="shop-grid-ls.html"
                                class="widget-list-link"
                                onclick="selectCategory(${root.id}); return false;">

                                View All

                            </a>

                        </li>

                        ${children
                            .map(
                                child => `
                                    <li class="widget-list-item">

                                        <a
                                            href="#"
                                            class="widget-list-link"
                                            onclick="selectCategory(${child.id}); return false;">

                                            ${child.name}

                                        </a>

                                    </li>
                                `
                            )
                            .join("")}

                    </ul>

                </div>

            </div>

        </div>
    `;
}

/**
 * ==========================
 * CATEGORY CLICK
 * ==========================
 */
function selectCategory(
    categoryId
) {

    history.pushState(
        {},
        "",
        `?categoryId=${categoryId}`
    );

    if (
        typeof currentFilter !== "undefined"
    ) {

        currentFilter.categoryId =
            categoryId;

        currentPage = 0;

        loadProducts(0);
    }
}

/**
 * ==========================
 * LOAD CATEGORY FROM URL
 * ==========================
 */
function initCategoryFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const categoryId =
        params.get("categoryId");

    if (
        categoryId &&
        typeof currentFilter !== "undefined"
    ) {

        currentFilter.categoryId =
            Number(categoryId);
    }
}

initCategoryFromUrl();