/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {ActionPlan, Microcredential, Student} from './credit';
import {Institustion} from './credit';
//import {v4 as uuidv4} from 'uuid';
const { createHash } = require('crypto');

@Info({title: 'Student Profile', description: 'Smart contract for building student profile'})
export class AssetTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const students: Student[] = [
            {
               Student_ID: 'afae0c91c1dfb251de183b820e2176c34e532be4097471e8225a50314cd0b1ea',
                Student_Name: '2bd806c97f0e00af1a1fc3328fa763a9269723c8db8fac4f93af71db186d6e90',
                Student_Email: 'a5037c19dbbf172d518ad66b047cb27b7d2d973742734a1a9696587d78a30cf8',
                Student_Address:'65 George Avenu, Sydney, Australia',
                Student_Contact_Number: '+420 78303405',
                Student_Date_of_Birth:'12-Jul-1986',

             
                Credential:[{
                    Credential_ID:'cred1',
                        Credential_Name:'MS',
                        Credential_Subject:'Blockchian',
                        Credential_Date:'2018-01-01',
                        Credential_Mark:'3.8',
                        Institution_Name:'uts'
                    }],
                
                ActionPlan: [{
                        Plan_ID:'A1',
                        Plan_Subject:'Master of Science',
                        Plan_Date:'13-09-2020',
                        Plan_Duration:'2 years',
                        Plan_Cost:'30000$',
                        Institution_Name:'uts'

                    }]
            },
            {
                Student_ID: 'bbebf6379c546cbb72f8e81adc4cb5c461c5958b8628ec1ce34d31b1f960016b',
                Student_Name: '81b637d8fcd2c6da6359e6963113a1170de795e4b725b84d1e0b4cfd9ec58ce9',
                Student_Email: '44d4be1e8052ee670d970f952424d53511e9e03a130a45ed64aaa23fa4748cb0',
                Student_Address:'65 Elizabith Avenu, Toronto, Canada',
                Student_Contact_Number: '+420 78303405',
                Student_Date_of_Birth:'19-Jun-1988',
           
                    Credential:[{
                        Credential_ID:'cred2',
                        Credential_Name:'PhD',
                        Credential_Subject:'Blockchian',
                        Credential_Date:'2018-01-01',
                        Credential_Mark:'4.2',
                        Institution_Name:'unsw'
                    }],
                    ActionPlan: [{
                        Plan_ID:'A2',
                        Plan_Subject:'Master of Art',
                        Plan_Date:'17-11-2019',
                        Plan_Duration:'1 year',
                        Plan_Cost:'15000$',
                        Institution_Name:'unsw'
                    }]
                  
               
            },
            
        ];


        for (const student of students) {
            student.docType = 'student';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(student.Student_ID, Buffer.from(stringify(sortKeysRecursive(student))));
            console.info(`Student ${student.Student_ID} initialized`);
        }

       
       const institutions: Institustion[] = [
       
        {
            Institustion_ID:'6530091124',
            Institustion_Name:'University A',
            Institustion_Email:'admin@universityA.com',
            Institustion_Address:'queensLand, AUS',
            Institustion_Contact_Number:'0456709781',
        },
        {
            Institustion_ID:'2254809110',
            Institustion_Name:'University B',
            Institustion_Email:'admin@universityB.com',
            Institustion_Address:'sydney, AUS',
            Institustion_Contact_Number:'0411705491',
        },
        {
            Institustion_ID:'7722103821',
            Institustion_Name:'University C',
            Institustion_Email:'admin@universityC.com',
            Institustion_Address:'Melbourn, AUS',
            Institustion_Contact_Number:'0433911000',
        },
       ];
        for (const institution of institutions) {
            institution.docType = 'institution';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(institution.Institustion_ID, Buffer.from(stringify(sortKeysRecursive(institution))));
            console.info(`Institution ${institution.Institustion_ID} initialized`);
        }
    }

//***************************************************************************************************************************************************************************************************** */


//***************************************************************************************************************************************************************************************************** */
 // Student Registeration for IBMM
//***************************************************************************************************************************************************************************************************** */

 // create hash to anonymize the student data
    @Transaction()
    public hash(data: string) {
return createHash('sha256').update(data).digest('hex');
}
    // AddStudent issues a new student to the world state with given details.
    @Transaction()
    public async AddStudent(ctx: Context, name: string, emailId: string, address: string, contact: string, date: string): Promise<void> {
        //Anonymize the student name and email address
        let hashname = this.hash(name);
        let hashemail = this.hash(emailId);
        // create student ID
        let hashID = this.hash(hashname + hashemail);
        let student = await ctx.stub.getState(hashID);
        let studentJSON = student.toString();
        console.log ("The student ID is", hashID);
        console.log('student list in ledger', studentJSON);

        if (student.length >0) {
            throw new Error(`The student ${hashID} already exist`);
        }
        const arr: Credential[] = [];
        const arry: ActionPlan[] = [];
        const stud: Student = {
            Student_ID: hashID,
            Student_Name: hashname,
            Student_Email: hashemail,
            Student_Address: address,
            Student_Contact_Number: contact,
            Student_Date_of_Birth: date,
            Credential: [],
            ActionPlan: [],
        };
        stud.docType = 'student';
        console.log('new student data getting into ledger', stud);
        await ctx.stub.putState(hashID, Buffer.from(stringify(sortKeysRecursive(stud))));
        return hashID;
    }
    // ReadStudent returns the student stored in the world state with given id.
    @Transaction(false)
    public async ReadStudentWithID(ctx: Context, id: string): Promise<string> {
        
        const studentJSON = await ctx.stub.getState(id); // get the student from chaincode state
        if (!studentJSON || studentJSON.length === 0) {
            throw new Error(`The student ${id} does not exist`);
        }
        return studentJSON.toString();
    }

    // CreateStudentID returns the student id stored in the world state with given hashid.
@Transaction(false)
public async CreateStudentID(ctx: Context, name: string, emailId: string): Promise<string> {
let hashname: any = this.hash(name);
let hashemail = this.hash(emailId);
let hashID = this.hash(hashname + hashemail);
const studentJSON = await ctx.stub.getState(hashID); // get the student from chaincode state
if (!studentJSON || studentJSON.length === 0) {
throw new Error(`The student ${hashID} does not exist`);
}
return studentJSON.toString();
}


    // StudentExists returns true when student with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async StudentExists(ctx: Context, id: string): Promise<boolean> {
        const studentJSON = await ctx.stub.getState(id);
        return studentJSON && studentJSON.length > 0;
    }

  

    // GetAllStudentss returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllStudents(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        let students = allResults.filter(i=>i.docType=="student")

        console.log("student");
         console.log(students);
        return JSON.stringify(students);
          
    }


    // UpdateAsset updates an existing asset in the world state with provided parameters.
    //     @Transaction()
    //     public async UpdateStudent(ctx: Context, id: string, emailId: string, address: string, contact: string, date: string): Promise<void> {
            
    // let hashemail = this.hash(emailId);

    //         const exists = await this.StudentExists(ctx, id);
    //         if (!exists) {
    //             throw new Error(`The student ${id} does not exist`);
    //         }

    //         // overwriting original asset with new asset
    //         const updatedStudent = {
            
            
    //             Student_Email: hashemail,
    //             Student_Address: address,
    //             StudentContact_Number: contact,
    //             Student_Date_of_Birth: date,

            
    //         };
    //         // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    //         return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedStudent))));
    //     }


//***************************************************************************************************************************************************************************************************** */
 // Institution Registeration
//***************************************************************************************************************************************************************************************************** */

  // AddInstitusion issues a new HEI to the world state with given details.
    @Transaction()
    public async AddInstitustion(ctx: Context, id: string, name: string, emailId: string, address: string, number: string): Promise<void> {
       
        const exists = await this.InstitutionExists(ctx, id);
        if (exists) {
            throw new Error(`The institusion ${id} already exists`);
        }
  
        const institusion = {
            Institustion_ID: id,
            Institustion_Name: name,
            Institustion_Email: emailId,
            Institustion_Address: address,
            Institustion_Contact_Number: number,
           
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(institusion))));
    }

    // InstitutionExists returns true when HEI with given ID exists in world state.
  @Transaction(false)
  @Returns('boolean')
  public async InstitutionExists(ctx: Context, id: string): Promise<boolean> {
      const institustionJSON = await ctx.stub.getState(id);
      return institustionJSON && institustionJSON.length > 0;
  }


//    // ReadInstitustion returns the HEI stored in the world state with given id.
//    @Transaction(false)
//    public async ReadInstitustion(ctx: Context, id: string): Promise<string> {
//        const institustionJSON = await ctx.stub.getState(id); // get the asset from chaincode state
//        if (!institustionJSON || institustionJSON.length === 0) {
//            throw new Error(`The institustion ${id} does not exist`);
//        }
//        return institustionJSON.toString();
//    }

   @Transaction(false)
   @Returns('string')
   public async GetAllInstitustions(ctx: Context): Promise<string> {
       const allResults = [];
       // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
       const iterator = await ctx.stub.getStateByRange('', '');
       let result = await iterator.next();
       while (!result.done) {
           const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
           let record;
           try {
               record = JSON.parse(strValue);
           } catch (err) {
               console.log(err);
               record = strValue;
           }
           allResults.push(record);
           result = await iterator.next();
       } 
       console.log("allResults");
        console.log(allResults)
        

       let institutions = allResults.filter(i=>i.docType=="institution")

       console.log("institution");
        console.log(institutions);
       return JSON.stringify(institutions);
       
   }



//-------------------------------------------------------------------------------------------


 // AddCredential for a student to the world state with given details.
 @Transaction()
 public async AddCredential(ctx: Context, id: string, credit_id: string, name: string, subject: string, inst_name: string, mark: string, date: string): Promise<void> {

   
    let student =  await ctx.stub.getState(id); // get the student from chaincode state
    let studentJSON=student.toString();

    if (!student || student.length === 0) {
    throw new Error(`The student ${id} does not exist`);
    }
   console.log('student data', studentJSON);

    let cred:Microcredential={
         
            
        Credential_ID: credit_id,
            Credential_Name: name,
            Credential_Subject: subject,
            Credential_Date: date,
            Credential_Mark: mark,
            Institution_Name: inst_name, 
        }; 
    
       
        console.log('cred data object', cred);
       

         // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'

        console.log(JSON.parse(studentJSON));
        let newStudent=JSON.parse(studentJSON);
       
        let flag=false;
   

         newStudent.Credential.forEach((d)=>{
         
       
        if(d.Credential_ID==credit_id){
         flag=true;
         console.log ("true");
        }
        })
        if(!flag){
            newStudent.Credential.push(cred);
           }
           await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(newStudent)))); 
        }




//-------------------------------------------------------------------------------------------


 // AddCredential for a student to the world state with given details.
 @Transaction()
 public async AddActionPlan(ctx: Context, id: string, plan_id: string, duration: string, subject: string, cost: string, date: string, inst_name: string): Promise<void> {




    let student =  await ctx.stub.getState(id); // get the student from chaincode state
    let studentJSON=student.toString();

    if (!student || student.length === 0) {
    throw new Error(`The student ${id} does not exist`);
    }
   console.log('student data', studentJSON);

    let plan:ActionPlan={
         
            
        Plan_ID: plan_id,
        Plan_Duration: duration,
            Plan_Subject: subject,
            Plan_Cost: cost,
            Plan_Date: date,
            Institution_Name: inst_name, 
        }; 
    
       
        console.log('Action plan data object', plan);
       

         // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'

        console.log(JSON.parse(studentJSON));
        let newStudent=JSON.parse(studentJSON);
       
        let flag=false;
   

         newStudent.ActionPlan.forEach((d)=>{
         
       
        if(d.Plan_ID==plan_id){
         flag=true;
         console.log ("true");
        }
        })
        if(!flag){
            newStudent.ActionPlan.push(plan);
           }
           await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(newStudent)))); 
        }
        };
   
    