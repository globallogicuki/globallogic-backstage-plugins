import { render } from '@testing-library/react';
import { StackedBar, StackedBarItem } from './StackedBar';

describe('StackedBar', () => {
  const mockData: StackedBarItem[] = [
    {
      id: 'failed',
      name: 'Failed',
      value: 1,
      color: 'red',
      textColor: 'rgb(192, 0, 5)',
    },
    {
      id: 'unknown',
      name: 'Unknown',
      value: 0,
      color: 'rgb(16, 96, 255)',
      textColor: 'rgb(16, 96, 255)',
    },
    {
      id: 'passed',
      name: 'Passed',
      value: 4,
      color: 'rgb(198, 233, 201)',
      textColor: 'rgb(0, 138, 34)',
    },
  ];

  it('renders the correct number of segments', () => {
    const { container } = render(<StackedBar data={mockData} />);
    const segments = mockData.map(item =>
      container.querySelector(`#${item.id}-segment`),
    ); // Select segments by ID
    expect(segments).toHaveLength(mockData.length);
  });

  it('renders segments with correct widths and colors', () => {
    const { container } = render(<StackedBar data={mockData} />);
    const totalValue = mockData.reduce((sum, item) => sum + item.value, 0);

    mockData.forEach(item => {
      const segment = container.querySelector(`#${item.id}-segment`); // Select segment by ID
      const expectedWidth = `${(item.value / totalValue) * 100}%`;
      expect(segment).toHaveStyle({
        width: expectedWidth,
        backgroundColor: item.color,
      });
    });
  });

  it('renders labels with correct text and values', () => {
    const { container } = render(<StackedBar data={mockData} />);

    mockData.forEach(item => {
      const labelContainer = container.querySelector(`#${item.id}-value`); // Select by ID
      expect(labelContainer?.textContent).toBe(`${item.name}: ${item.value}`); // Check textContent
    });
  });

  it('renders label values with correct text colors', () => {
    const { container } = render(<StackedBar data={mockData} />);

    mockData.forEach(item => {
      const valueElement = container.querySelector(`#${item.id}-value span`); // Select value span by ID
      expect(valueElement).toHaveStyle({ color: item.textColor });
    });
  });

  describe('label text alignment', () => {
    it('aligns labels correctly with 2 items', () => {
      const twoItems = mockData.slice(0, 2);
      const { container } = render(<StackedBar data={twoItems} />);

      const labelContainers = twoItems.map(
        item => container.querySelector(`#${item.id}-value`)?.parentElement,
      ); // Select label containers by ID

      expect(labelContainers[0]).toHaveStyle({ textAlign: 'left' });
      expect(labelContainers[1]).toHaveStyle({ textAlign: 'right' });
    });

    it('aligns labels correctly with 3 items', () => {
      const { container } = render(<StackedBar data={mockData} />);

      const labelContainers = mockData.map(
        item => container.querySelector(`#${item.id}-value`)?.parentElement,
      ); // Select label containers by ID

      expect(labelContainers[0]).toHaveStyle({ textAlign: 'left' });
      expect(labelContainers[1]).toHaveStyle({ textAlign: 'center' });
      expect(labelContainers[2]).toHaveStyle({ textAlign: 'right' });
    });

    it('aligns labels left with 4 items', () => {
      const fourItems = [
        ...mockData,
        {
          id: 'fourth',
          name: 'Newbie',
          value: 1,
          color: 'orange',
          textColor: 'rgb(255, 84, 11)',
        },
      ];
      const { container } = render(<StackedBar data={fourItems} />);

      const labelContainers = fourItems.map(
        item => container.querySelector(`#${item.id}-value`)?.parentElement,
      );

      labelContainers.forEach(labelContainer => {
        expect(labelContainer).toHaveStyle({ textAlign: 'left' });
      });
    });
  });
});
