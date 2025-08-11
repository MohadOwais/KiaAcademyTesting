const Section2 = ({course}:any) => {
    return (
        <div className="container course-details-benefits mt-4">

            <ul className="list-unstyled d-flex justify-content-center gap-4">
                <li className="fw-bold mt-1">On this page:</li>
                <button className="btn btn-primary">Course Content</button>
                <li>Live Sessions</li>
                <li>Hands-on Practice</li>
                <li>Certification</li>
            </ul>
        </div>
    )
}

export default Section2