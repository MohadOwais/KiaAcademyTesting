import "../Main.css"
import Image from 'next/image';
import certificate from '../../../../public/images/certificate.svg';
import AccordionComponent from './Accordion';

const Section3 = ({ course }: any) => {
    return (
        <div className="course-details-section-three">
            <div className="container">
                <div className="d-flex align-items-start">
                    <div className="no-gap">
                        <Image src={certificate} width={100} height={100} alt="certificate-photo" className="img-fluid" />
                    </div>
                    <div className="text-content">
                        <h1>Prepare for certification</h1>
                        <h3>Learn new skills you need at your own pace with our bite-sized lessons.</h3>
                        <h4>Basic ABAP Programming</h4>
                    </div>
                </div>
                <AccordionComponent />
                <h1>Intermediate ABAP Programming</h1>
                <AccordionComponent />
                <h1>Data Modeling in ABAP Dictionary and ABAP Core Data Services</h1>
                <AccordionComponent />
            </div>
        </div>
    );
}

export default Section3;