import React from "react";
import { useBackend } from "main/utils/useBackend";
import { Navigate, MemoryRouter, Routes, Route } from "react-router-dom";
import { useCurrentUser } from "main/utils/currentUser";
import { waitFor, render, screen } from "@testing-library/react";
import {CheckUserInCommons, useUserInCommons} from "main/components/Commons/CheckUserInCommons";
import PlayPage from "main/pages/PlayPage";
import { QueryClient, QueryClientProvider } from "react-query";

jest.mock('main/utils/currentUser');
jest.mock('main/utils/useBackend');

describe ('RouteGuard Tests', () => {

  const queryClient = new QueryClient();

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
      name:"Test Commons",
      showChat:true,
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

    const mockedNavigate = jest.fn();

    jest.mock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useParams: () => ({
          commonsId: 2
      }),
      useNavigate: () => mockedNavigate,
    }));
    
    render(
      <QueryClientProvider client={queryClient}>
          <MemoryRouter>
              <PlayPage />
          </MemoryRouter>
      </QueryClientProvider>
    );

    // check if PlayPage is rendered correctly

    await waitFor(() => {
      expect(screen.queryByText('404')).toBeInTheDocument();
    });

  });

  test('allows user to access play page if they have joined the commons', async () => {

    const mockedNavigate = jest.fn();

    jest.mock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useParams: () => ({
          commonsId: 1
      }),
      useNavigate: () => mockedNavigate,
    }));

    render(
      <QueryClientProvider client={queryClient}>
          <MemoryRouter>
              <PlayPage />
          </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('404')).not.toBeInTheDocument();
    });

  });

});