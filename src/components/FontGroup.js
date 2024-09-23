import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Container, Form, Table } from "react-bootstrap";

export default function FontGroup({ fonts }) {
  const [fontGroups, setFontGroups] = useState([]);
  const [fontGroupId, setFontGroupId] = useState("");
  const [error, setError] = useState(null);
  const uploadedFonts = fonts;

  const [formState, setFormState] = useState({
    group_title: "",
    fonts: [],
  });

  const [rows, setRows] = useState([
    { id: 1, font_name: "", font_id: "", specific_size: 1.00, price_change: 0 }
  ]);

  const handleGroupTitle = (event) => {
    setFormState({ ...formState, group_title: event.target.value });
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);
    setFormState({...formState, fonts: [...updatedRows] })
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now(), font_name: "", font_id: "", specific_size: 1.00, price_change: 0 }]);
  };

  const deleteRow = (id) => {
    const updatedRows = rows.filter(row => row.id !== id);
    setRows(updatedRows);
    setFormState({...formState, fonts: [...updatedRows] })
  };
  

  const submitForm = () => {
    // Validation: Ensure at least two fonts are selected
    if(formState.group_title == ""){
      setError("Group title must not be empty");
      return;
    }
    const filledRows = rows.filter(row => row.font_id && row.font_name);
    if (filledRows.length < 2) {
      setError("You must select at least two fonts, and font names");
      return;
    }
    // No validation errors, proceed
    setError(null);

    const formData = new FormData();
    formData.append("group_title", formState.group_title);
    formData.append("fonts", JSON.stringify(formState.fonts));

    const action_url = fontGroupId ? "http://localhost/font-group-backend/api/update_font_group.php?id="+fontGroupId
                      : "http://localhost/zepto-task/font-group-backend/api/create_font_group.php";

    axios
      .post(action_url, formData)
      .then((response) => {
        if(response.data.success == 200) {
          setRows([ { id: 1, font_name: "", font_id: "", specific_size: 1.00, price_change: 0 }]);
          setFormState({
            group_title: "",
            fonts: [],
          });
          setError(null);
          setFontGroupId("");
          groupList();
        }else{
          setError(response.data.message);
        }
      })
      .catch((error) => {
        setError("sorry operation failed try again");
      });
    
  };

  const groupList = () => {
    axios.get("http://localhost/font-group-backend/api/group_list.php").then((response) => {
       if(response.data.success == 200) {
          setFontGroups(response.data.data)
       }
    })
    .catch((error) => {
      setError("sorry operation failed try again");
    });
  };

  const deleteGroup = (delete_id) => {
    axios.get("http://localhost/font-group-backend/api/delete_group.php?id=" + delete_id).then((response) => {
      if(response.data.success == 200 ){
        const updated_groups = fontGroups.filter(group => group.id != delete_id);
        setFontGroups(updated_groups);
      }
    })
    .catch((error) => {
      setError("sorry operation failed try again");
    });
  }

  const handleGroupEdit = (edit_id) => {
    axios.get("http://localhost/font-group-backend/api/edit_font_group.php?id=" + edit_id).then((response) => {
      const data = response.data.data;

      // Parse the font names and font IDs into separate arrays
      const fontNames = data.font_names.split(",");
      const fontIds = data.font_ids.split(",");

      // Create rows from fontNames and fontIds
      const updatedRows = fontNames.map((name, index) => ({
        id: index + 1, // Assigning a unique ID for each row
        font_name: name.trim(),
        font_id: fontIds[index]?.trim() || "",
        specific_size: 1.00, // You can use a default or existing value
        price_change: 0 // Default or existing value
      }));

      // Update formState and rows
      setFormState({
        group_title: data.group_title,
        fonts: updatedRows,
      });
      setRows(updatedRows);
      setFontGroupId(data.id)
    });
  }

  useEffect(()=> {
    groupList();
  },[])

  return (
    <Container className="mt-4">
      {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}
      <input
        className="form-control"
        placeholder="Group Title"
        onChange={handleGroupTitle}
        value={formState.group_title}
      />
      <Card>
        <Card.Body>
        <Card.Title>Create Font Group</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">You have to select at least two fonts</Card.Subtitle>
          <Table striped bordered hover>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <input
                      className="form-control"
                      placeholder="Font Name"
                      onChange={(e) => handleInputChange(index, 'font_name', e.target.value)}
                      value={row.font_name}
                    />
                  </td>
                  <td>
                    <Form.Select
                      onChange={(e) => handleInputChange(index, 'font_id', e.target.value)}
                      value={row.font_id}
                    >
                      <option>Select a font</option>
                      {uploadedFonts.length > 0 &&
                        uploadedFonts.map((font) => (
                          <option key={font.id} value={font.id}>
                            {font.font_name}
                          </option>
                        ))}
                    </Form.Select>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="number"
                      value={row.specific_size}
                      onChange={(e) => handleInputChange(index, 'specific_size', e.target.value)}
                      placeholder="Specific Size"
                    />
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="number"
                      value={row.price_change}
                      onChange={(e) => handleInputChange(index, 'price_change', e.target.value)}
                      placeholder="Price Change"
                    />
                  </td>
                  <td>
                    <Button variant="danger" onClick={() => deleteRow(row.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      <Button className='mt-2' onClick={addRow}> Add More </Button>
      {fontGroupId ? (
         <Button className='mt-2'  onClick={submitForm}> Update </Button>
      ): (
        <Button className='mt-2'  onClick={submitForm}> Create </Button>
      )}

      
          <Card className='mt-4'>
            <Card.Body>
            <Card.Title>Our fonts Groups:</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">List of all available font groups</Card.Subtitle>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>NAME</th>
                        <th>FontS</th>
                        <th>Count</th>
                        <th></th>
                        </tr>
                    </thead>
                    <tbody>
                      {fontGroups.length >  0 ? (
                        fontGroups.map((group, index)=> (
                          <tr key={index}>
                            <td>{group.group_title}</td>
                            <td>{group.font_names}</td>
                            <td> {group.font_ids != "" ? group.font_ids.split(',').length : group.font_ids }</td>
                            <td>
                              <Button className="btn btn-warning"  onClick={()=> handleGroupEdit(group.id)}>Edit</Button>
                              <Button className="btn btn-danger" onClick={()=> deleteGroup(group.id)}>Delete</Button>
                            </td>
                          </tr>
                        ))
                      ): (
                        <tr>
                            <td>Data not found </td>
                          </tr>
                      )}
                        
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    </Container>
  );
}
