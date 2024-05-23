import React from "react";
import { useBackend } from "main/utils/useBackend";
import { useParams, Navigate, MemoryRouter, Routes, Route } from "react-router-dom";
import { useCurrentUser } from "main/utils/currentUser";
import { waitFor, render, screen } from "@testing-library/react";
import ProtectedRoute from "main/components/Commons/RouteGuard";
import PlayPage from "main/pages/PlayPage";
import NotFoundPage from "main/pages/NotFoundPage";


jest.mock('main/utils/currentUser');
jest.mock('main/utils/useBackend');

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    Navigate: jest.fn(({ to }) => <div>{`Redirected to ${to}`}</div>),
  };
});

describe ('RouteGuard Tests', () => {

  const mockCurrentUser = {
    root: {
      user: {
        commons: [{ id: 1, name: 'Test Commons' }],
      },
    },
  };

  const mockCommons = [
    { 
      aboveCapacityHealthUpdateStrategy:"Linear",
      belowCapacityHealthUpdateStrategy:"Linear", 
      capacityPerUser: 50,
      carryingCapacity: 100, 
      cowPrice: 100,
      degradationRate: 0.001, 
      id:1,
      lastDate:"2024-06-21T00:00:00",
      milkPrice:1,
      name:"test",
      showChat:false,
      showLeaderboard:false,
      startingBalance:10000,
      startingDate:"2024-05-21T00:00:00" 
    },
    { 
      aboveCapacityHealthUpdateStrategy:"Linear",
      belowCapacityHealthUpdateStrategy:"Linear", 
      capacityPerUser: 50,
      carryingCapacity: 100, 
      cowPrice: 100,
      degradationRate: 0.001, 
      id:2,
      lastDate:"2024-07-21T00:00:00",
      milkPrice:1,
      name:"test",
      showChat:false,
      showLeaderboard:false,
      startingBalance:10000,
      startingDate:"2024-06-21T00:00:00" 
    }
  ];

  beforeEach(() => {
    useCurrentUser.mockReturnValue({ data: mockCurrentUser });
    useBackend.mockReturnValue({ data: mockCommons });
  });

  test('redirects user to not found page when user enters URL for commons they have not joined', async () => {
    
    render(
        <MemoryRouter initialEntries={['/play/2']}>
            <Routes>
              <Route path="/play/:commonsId" element={<ProtectedRoute element={PlayPage} />} />
              <Route path="/notfound" element={<NotFoundPage />} />
            </Routes>
        </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('The Page You Are Looking For Does Not Exist Or You Do Not Have Access!')).toBeInTheDocument();
    });

  });

  test('allows user to access play page if they have joined the commons', async () => {

    render(
        <MemoryRouter initialEntries={['/play/1']}>
          <Routes>
            <Route path="/play/:commonsId" element={<ProtectedRoute element={PlayPage} />} />
            <Route path="/notfound" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Announcements')).toBeInTheDocument();
    });

  });

});