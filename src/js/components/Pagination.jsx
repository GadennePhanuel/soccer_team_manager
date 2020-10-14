import React from 'react';

const Pagination = ({ currentPage, itemsPerPage, length, onPageChanged }) => {
    const pagesCount = Math.ceil(length / itemsPerPage);
    const pages = [];

    for (let i = 1; i <= pagesCount; i++) {
        pages.push(i);
    }
    return (
        <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
            <div className="btn-group mr-2" role="group" aria-label="First group">
                <button className={"btn btn-secondary" + (currentPage === 1 && "disabled")} onClick={() => onPageChanged(currentPage - 1)}>&laquo;</button>
                {pages.map(page =>
                    <button
                        key={page}
                        onClick={() => onPageChanged(page)}
                        className={"btn btn-secondary" + (currentPage === page && "active")}
                    >
                        {page}
                    </button>)}

                <button type="button" className={"btn btn-secondary" + (currentPage === pages.length && "disabled")} onClick={() => onPageChanged(currentPage + 1)}>&raquo;</button>
            </div>
        </div>
    );
};

Pagination.getData = (items, currentPage, itemsPerPage) => {

    // d'ou on part (start) pendant combien (itemsPerPage)
    const start = currentPage * itemsPerPage - itemsPerPage;
    return items.slice(start, start + itemsPerPage);

}

export default Pagination;